import * as tf from "@tensorflow/tfjs";
import { renderBoxes } from "./renderBox";

/**
 * Function to detect image.
 * @param {HTMLImageElement} imgSource image source
 * @param {tf.GraphModel} model loaded YOLOv5 tensorflow.js model
 * @param {Number} classThreshold class threshold
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export const detectImage = async (imgSource, model, classThreshold, canvasRef) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

  tf.engine().startScope(); // start scoping tf engine
  const input = tf.tidy(() => {
    return tf.image
      .resizeBilinear(tf.browser.fromPixels(imgSource), [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0);
  });

  await model.net.executeAsync(input).then((res) => {
    const [boxes, scores, classes] = res.slice(0, 3);
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    const classes_data = classes.dataSync();
    renderBoxes(canvasRef, classThreshold, boxes_data, scores_data, classes_data); // render boxes
    tf.dispose(res); // clear memory
  });

  tf.engine().endScope(); // end of scoping
};

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv5 tensorflow.js model
 * @param {Number} classThreshold class threshold
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export const detectVideo = (vidSource, model, classThreshold, canvasRef) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

  /**
   * Function to detect every frame from video
   */
  const detectFrame = async () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
      const ctx = canvasRef.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
      return; // handle if source is closed
    }

    tf.engine().startScope(); // start scoping tf engine
    const input = tf.tidy(() => {
      return tf.image
        .resizeBilinear(tf.browser.fromPixels(vidSource), [modelWidth, modelHeight]) // resize frame
        .div(255.0) // normalize
        .expandDims(0);
    });

    await model.net.executeAsync(input).then((res) => {
      const [boxes, scores, classes] = res.slice(0, 3);
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      renderBoxes(canvasRef, classThreshold, boxes_data, scores_data, classes_data); // render boxes
      tf.dispose(res); // clear memory
    });

    requestAnimationFrame(detectFrame); // get another frame
    tf.engine().endScope(); // end of scoping
  };

  detectFrame(); // initialize to detect every frame
};
