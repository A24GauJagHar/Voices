// Import TensorFlow.js
import * as tf from '@tensorflow/tfjs';

// Import the PoseNet pre-trained model
import * as posenet from '@tensorflow-models/posenet';

// Import libraries for reading JPGs
import fs from 'fs';
import jpeg from 'jpeg-js';

// Function to read an image and convert it into a tensor
function readImage(path) {
  const buf = fs.readFileSync(path);
  const pixels = jpeg.decode(buf, true);
  return tf.browser.fromPixels(pixels);
}

// Main async function
(async () => {
  // Load PoseNet model
  const net = await posenet.load();

  // Read your image (replace with your filename, e.g., 'person.jpg')
  const image = readImage('person.jpg');

  // Estimate pose
  const pose = await net.estimateSinglePose(image, {
    flipHorizontal: false,
  });

  // Show detected keypoints (body parts and their positions)
  console.log('Detected pose:');
  console.log(JSON.stringify(pose, null, 2));
})();
