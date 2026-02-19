<!-- src/components/PoseSkeleton.vue -->
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
          style="width:100%; border:1px solid #ddd; border-radius:8px; display:block"
        ></video>
        <canvas
          ref="canvas"
          style="position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none"
        ></canvas>


        <div class="mt-2">
          <v-btn @click="startCamera(selectedId)" color="primary">Abrir cámara</v-btn>
          <v-btn @click="stopCamera" variant="outlined" class="ml-2">Parar</v-btn>
          <v-switch
            v-model="useThunder"
            label="Usar MoveNet Thunder"
            hide-details
            inset
            class="ml-4"
          />
        </div>


        <div class="mt-2 camera-select">
          <label for="cam-select"><small>Seleccionar cámara</small></label>
          <select id="cam-select" v-model="selectedId" class="select">
            <option v-for="d in devices" :key="d.deviceId" :value="d.deviceId">
              {{ d.label }}
            </option>
          </select>
        </div>
      </div>


      <!-- DERECHA: Panel de features -->
      <v-card width="300" class="pa-4">
        <h3>Features</h3>
        <p><b>Puntos detectados:</b> {{ numKeypoints }}</p>
        <p><b>Missing (score&lt;0.3):</b> {{ missingCount }}</p>
        <p><b>Ángulo codo izq.:</b> {{ angles.leftElbow != null ? angles.leftElbow.toFixed(1) + '°' : '-' }}</p>
        <p><b>Ángulo codo der.:</b> {{ angles.rightElbow != null ? angles.rightElbow.toFixed(1) + '°' : '-' }}</p>
      </v-card>
    </v-main>
  </v-app>
</template>


<script>
import { ref, reactive } from 'vue'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'


export default {
  name: 'PoseSkeleton',


  data() {
    return {
      // Refs wrappers (se crean en mounted para apuntar a $refs)
      video: null,     // será ref(this.$refs.video) => usar this.video.value
      canvas: null,    // será ref(this.$refs.canvas) => usar this.canvas.value


      // Stream & detector
      currentStream: null,
      detector: null,
      animationId: null,


      // UI / estado
      devices: [],
      selectedId: '',
      useThunder: false,
      numKeypoints: 0,
      missingCount: 0,
      angles: reactive({ leftElbow: null, rightElbow: null }),


      // devicechange handler ref para poder quitarlo
      onDeviceChange: null
    }
  },


  mounted() {
    // Bind the template refs to composition-style refs so we can use .value
    // (lo hacemos en mounted cuando this.$refs ya existe)
    const { ref: vueRef } = require('vue')
    this.video = vueRef(this.$refs.video)
    this.canvas = vueRef(this.$refs.canvas)


    // Arranca cámara por defecto (pide permiso)
    this.startCamera(this.selectedId).catch((err) => {
      // No bloquear la app; avisamos al usuario
      console.error('No se pudo iniciar la cámara al montar:', err)
    })


    // Escuchar cambios hardware de cámaras
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      this.onDeviceChange = async () => {
        await this.listVideoInputs()
      }
      navigator.mediaDevices.addEventListener('devicechange', this.onDeviceChange)
    }


    // Lista inicial de dispositivos (si permiso aún no concedido, saldrán genéricos)
    this.listVideoInputs().catch(() => {
      /* no fatal */
    })
  },


  beforeUnmount() {
    // Parar stream y quitar listener
    this.stopCamera()
    if (navigator.mediaDevices && navigator.mediaDevices.removeEventListener && this.onDeviceChange) {
      navigator.mediaDevices.removeEventListener('devicechange', this.onDeviceChange)
      this.onDeviceChange = null
    }
  },


  watch: {
    // Si el usuario cambia de cámara desde el select
    selectedId(newId, oldId) {
      if (newId && newId !== oldId) {
        this.startCamera(newId).catch(err => {
          console.error('Error al cambiar de cámara:', err)
        })
      }
    },


    // Si el usuario cambia Thunder/Lightning, reiniciamos detector
    useThunder(isThunder) {
      // Reiniciar detector para aplicar nuevo modelo
      if (this.detector && this.detector.dispose) {
        try { this.detector.dispose() } catch (e) { /* ignore */ }
        this.detector = null
      }
      // Iniciar de nuevo si ya hay stream
      if (this.currentStream) {
        this.initMoveNet().catch(err => {
          console.error('No se pudo reiniciar MoveNet tras cambiar tipo:', err)
        })
      }
    }
  },


  methods: {
    // Lista cámaras
    async listVideoInputs() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return
      const all = await navigator.mediaDevices.enumerateDevices()
      const cams = all.filter(d => d.kind === 'videoinput')
      this.devices = cams.map((d, idx) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${idx + 1}`
      }))
      // Si no hay seleccionado, escoger la primera (si existe)
      if (!this.selectedId && this.devices.length) {
        this.selectedId = this.devices[0].deviceId
      }
    },


    // Start camera (opcional deviceId)
    async startCamera(deviceId = '') {
      // Stop previous stream cleanly
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(t => t.stop())
        this.currentStream = null
      }
      // Build constraints
      const constraints = deviceId
        ? { video: { deviceId: { exact: deviceId } }, audio: false }
        : { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }


      // Request MediaStream
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.currentStream = stream


      // Attach to the video element (usando this.video.value)
      // Aseguramos que el ref existe (si por alguna razón no, fallback a $refs)
      const videoEl = (this.video && this.video.value) ? this.video.value : this.$refs.video
      if (!videoEl) throw new Error('Elemento video no disponible')
      videoEl.srcObject = stream
      // Intentamos reproducir
      await videoEl.play().catch(err => {
        // Algunos navegadores exigen interacción; dejamos el stream pero no bloqueamos
        console.warn('video.play() falló (puede requerir interacción del usuario):', err)
      })


      // Tras permiso, refrescamos lista de dispositivos (ahora sí se ven labels)
      await this.listVideoInputs()


      // Iniciamos MoveNet (si ya había detector lo reinicia)
      await this.initMoveNet()
    },


    stopCamera() {
      // Stop tracks
      if (this.currentStream) {
        try {
          this.currentStream.getTracks().forEach(t => t.stop())
        } catch (e) { /* ignore */ }
        this.currentStream = null
      }


      // Cancel animation
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }


      // Dispose detector
      if (this.detector && this.detector.dispose) {
        try { this.detector.dispose() } catch (e) { /* ignore */ }
        this.detector = null
      }


      // Clear canvas
      const canvasEl = (this.canvas && this.canvas.value) ? this.canvas.value : this.$refs.canvas
      if (canvasEl) {
        const ctx = canvasEl.getContext('2d')
        try { ctx.clearRect(0, 0, canvasEl.width, canvasEl.height) } catch (e) { /* ignore */ }
      }


      // Reset stats
      this.numKeypoints = 0
      this.missingCount = 0
      this.angles.leftElbow = null
      this.angles.rightElbow = null
    },


    async initMoveNet() {
      // Asegurarse de tener video preparado
      const videoEl = (this.video && this.video.value) ? this.video.value : this.$refs.video
      if (!videoEl) throw new Error('Video no inicializado antes de initMoveNet')


      // Backend WebGL
      try {
        await tf.setBackend('webgl')
        await tf.ready()
      } catch (e) {
        console.warn('No se pudo seleccionar backend webgl, utilizando backend por defecto:', e)
      }


      // Dispose previo si existe
      if (this.detector && this.detector.dispose) {
        try { this.detector.dispose() } catch (e) { /* ignore */ }
        this.detector = null
      }


      const modelType = this.useThunder
        ? poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
        : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING


      // Crear detector MoveNet
      this.detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType
      })


      // Iniciar loop de detección (asegura que no haya dos loops)
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
      this.detectPose().catch(err => {
        console.error('detectPose error:', err)
      })
    },


    async detectPose() {
      if (!this.detector) return
      const videoEl = (this.video && this.video.value) ? this.video.value : this.$refs.video
      if (!videoEl) return


      try {
        const poses = await this.detector.estimatePoses(videoEl)
        this.drawResults(poses)
      } catch (e) {
        console.error('Error en estimatePoses:', e)
      }


      // Keep the loop
      this.animationId = requestAnimationFrame(() => this.detectPose())
    },


    drawResults(poses) {
      const canvasEl = (this.canvas && this.canvas.value) ? this.canvas.value : this.$refs.canvas
      const videoEl = (this.video && this.video.value) ? this.video.value : this.$refs.video
      if (!canvasEl || !videoEl) return


      const ctx = canvasEl.getContext('2d')
      // Tamaños reales del video (origen) y del elemento mostrado (cliente)
      const videoWidth = videoEl.videoWidth || videoEl.clientWidth
      const videoHeight = videoEl.videoHeight || videoEl.clientHeight
      const displayWidth = videoEl.clientWidth
      const displayHeight = videoEl.clientHeight


      // Ajustamos el canvas al tamaño de pantalla (en píxeles del layout)
      canvasEl.width = displayWidth
      canvasEl.height = displayHeight


      // Factor de escala entre coordenadas del modelo (basadas en videoWidth/Height)
      const scaleX = videoWidth ? (displayWidth / videoWidth) : 1
      const scaleY = videoHeight ? (displayHeight / videoHeight) : 1


      // Limpiar canvas
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)


      if (!poses || !poses.length) {
        // sin poses
        this.numKeypoints = 0
        this.missingCount = 0
        return
      }


      const keypoints = poses[0].keypoints || []
      this.numKeypoints = keypoints.length
      this.missingCount = keypoints.filter(k => (k.score ?? 0) < 0.3).length


      // Dibuja puntos
      keypoints.forEach(kp => {
        if ((kp.score ?? 0) > 0.3) {
          const x = (kp.x ?? 0) * scaleX
          const y = (kp.y ?? 0) * scaleY
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, 2 * Math.PI)
          ctx.fillStyle = 'lime'
          ctx.fill()
        }
      })


      // Dibuja líneas del esqueleto (pares por nombre)
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
        const kp1 = keypoints.find(k => (k.name === a) || (k.part === a))
        const kp2 = keypoints.find(k => (k.name === b) || (k.part === b))
        if ((kp1?.score ?? 0) > 0.3 && (kp2?.score ?? 0) > 0.3) {
          const x1 = (kp1.x ?? 0) * scaleX
          const y1 = (kp1.y ?? 0) * scaleY
          const x2 = (kp2.x ?? 0) * scaleX
          const y2 = (kp2.y ?? 0) * scaleY
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = 'cyan'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })


      // Calcular ángulos de ejemplo (codo)
      const left = this.calcAngle(keypoints, 'left_shoulder', 'left_elbow', 'left_wrist')
      const right = this.calcAngle(keypoints, 'right_shoulder', 'right_elbow', 'right_wrist')
      this.angles.leftElbow = left
      this.angles.rightElbow = right
    },


    calcAngle(keypoints, a, b, c) {
      const A = keypoints.find(k => (k.name === a) || (k.part === a))
      const B = keypoints.find(k => (k.name === b) || (k.part === b))
      const C = keypoints.find(k => (k.name === c) || (k.part === c))
      if (!A || !B || !C) return null
      if ((A.score ?? 0) < 0.3 || (B.score ?? 0) < 0.3 || (C.score ?? 0) < 0.3) return null


      const ABx = A.x - B.x
      const ABy = A.y - B.y
      const CBx = C.x - B.x
      const CBy = C.y - B.y


      const dot = ABx * CBx + ABy * CBy
      const magAB = Math.sqrt(ABx * ABx + ABy * ABy)
      const magCB = Math.sqrt(CBx * CBx + CBy * CBy)
      if (magAB === 0 || magCB === 0) return null
      let cos = dot / (magAB * magCB)
      // Clamp numerical errors
      cos = Math.max(-1, Math.min(1, cos))
      const angle = Math.acos(cos)
      return (angle * 180) / Math.PI
    }
  }
}
</script>


<style scoped>
/* Container: stack video and select vertically to save horizontal space */
.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}


/* Video frame with fixed aspect ratio and rounded corners */
.stage {
  position: relative;
  width: min(100%, 720px);
  aspect-ratio: 4 / 3;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}


/* The video element fills the frame */
.video {
  width: 100%;
  height: 100%;
  object-fit: contain; /* keep proportions without cropping */
  display: block;
}


/* Simple select below the video */
.camera-select {
  width: min(100%, 720px);
}


.camera-select .select {
  width: 100%;
  padding: 6px 8px;
}
</style>
