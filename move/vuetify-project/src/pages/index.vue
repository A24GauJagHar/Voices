<template>
  <v-app>
    <v-main class="pa-4 d-flex flex-row gap-4">
      <!-- IZQUIERDA: Vídeo + Canvas -->
      <div style="position:relative; width:720px; max-width:100%">
        <video
          ref="video"
          autoplay
          playsinline
          muted
          style="width:100%; border:1px solid #ddd; border-radius:8px"
        ></video>
        <canvas
          ref="canvas"
          style="position:absolute; left:0; top:0; width:100%; height:100%"
        ></canvas>


        <div class="mt-2">
          <v-btn @click="startCamera" color="primary">Abrir cámara</v-btn>
          <v-btn @click="stopCamera" variant="outlined" class="ml-2">Parar</v-btn>
          <v-switch
            v-model="useThunder"
            label="Usar MoveNet Thunder"
            hide-details
            inset
            class="ml-4"
          />
        </div>
      </div>


      <!-- DERECHA: Panel de features -->
      <v-card width="300" class="pa-4">
        <h3>Features</h3>
        <p><b>Puntos detectados:</b> {{ numKeypoints }}</p>
        <p><b>Missing (score&lt;0.3):</b> {{ missingCount }}</p>
        <p><b>Ángulo codo izq.:</b> {{ angles.leftElbow?.toFixed(1) ?? '-' }}°</p>
        <p><b>Ángulo codo der.:</b> {{ angles.rightElbow?.toFixed(1) ?? '-' }}°</p>
      </v-card>
    </v-main>
  </v-app>
</template>


<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'


// Refs
const video = ref(null)
const canvas = ref(null)
let streamRef = null
let detector = null
let animationId = null


// Estado
const useThunder = ref(false)
const numKeypoints = ref(0)
const missingCount = ref(0)
const angles = reactive({ leftElbow: null, rightElbow: null })


// ==== CÁMARA ====
async function startCamera() {
  try {
    streamRef = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    })
    video.value.srcObject = streamRef
    await video.value.play()
    await initMoveNet()
  } catch (e) {
    alert('No se pudo abrir la cámara: ' + e.message)
  }
}


function stopCamera() {
  if (streamRef) {
    streamRef.getTracks().forEach(t => t.stop())
    streamRef = null
  }
  if (animationId) cancelAnimationFrame(animationId)
  if (detector) detector.dispose()
}


// ==== MOVENET ====
async function initMoveNet() {
  // Espera a que TensorFlow esté listo
  await tf.setBackend('webgl')   // Fuerza backend estable
  await tf.ready()


  const model = useThunder.value
    ? poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
    : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING


  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: model }
  )


  detectPose()
}


// ==== DETECCIÓN LOOP ====
async function detectPose() {
  if (!detector || !video.value) return
  const poses = await detector.estimatePoses(video.value)
  drawResults(poses)
  animationId = requestAnimationFrame(detectPose)
}


// ==== DIBUJAR ====
function drawResults(poses) {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  const { width, height } = video.value.getBoundingClientRect()
  canvas.value.width = width
  canvas.value.height = height


  if (!poses.length) return


  const keypoints = poses[0].keypoints
  numKeypoints.value = keypoints.length
  missingCount.value = keypoints.filter(k => k.score < 0.3).length


  // Dibuja puntos
  keypoints.forEach(kp => {
    if (kp.score > 0.3) {
      ctx.beginPath()
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = 'lime'
      ctx.fill()
    }
  })


  // Dibuja líneas del esqueleto
  const edges = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_hip', 'right_hip'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle']
  ]


  edges.forEach(([a, b]) => {
    const kp1 = keypoints.find(k => (k.name || k.part) === a)
    const kp2 = keypoints.find(k => (k.name || k.part) === b)
    if (kp1?.score > 0.3 && kp2?.score > 0.3) {
      ctx.beginPath()
      ctx.moveTo(kp1.x, kp1.y)
      ctx.lineTo(kp2.x, kp2.y)
      ctx.strokeStyle = 'cyan'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  })


  // Calcular ángulos de ejemplo
  angles.leftElbow = calcAngle(keypoints, 'left_shoulder', 'left_elbow', 'left_wrist')
  angles.rightElbow = calcAngle(keypoints, 'right_shoulder', 'right_elbow', 'right_wrist')
}


// ==== UTILIDADES ====
function calcAngle(keypoints, a, b, c) {
  const A = keypoints.find(k => k.name === a)
  const B = keypoints.find(k => k.name === b)
  const C = keypoints.find(k => k.name === c)
  if (!A || !B || !C) return null
  if (A.score < 0.3 || B.score < 0.3 || C.score < 0.3) return null


  const AB = { x: A.x - B.x, y: A.y - B.y }
  const CB = { x: C.x - B.x, y: C.y - B.y }


  const dot = AB.x * CB.x + AB.y * CB.y
  const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2)
  const magCB = Math.sqrt(CB.x ** 2 + CB.y ** 2)
  const angle = Math.acos(dot / (magAB * magCB))
  return (angle * 180) / Math.PI
}


onUnmounted(() => stopCamera())
</script>


<style>
body {
  background-color: #fafafa;
}
</style>





