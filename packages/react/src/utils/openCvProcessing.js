/* eslint-disable no-undef */
export async function processImageWithThreshold(
  processingType,
  originalImage,
  dispatch,
  thresholdValue = 127,
) {
  try {
    const imageUrl = originalImage?.src;
    if (!imageUrl || !window.cv) return;

    const imageElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const src = window.cv.imread(canvas);
    let dst = new window.cv.Mat();

    switch (processingType) {
      case 'noiseReduction': {
        const gray = new window.cv.Mat();
        window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);
        window.cv.GaussianBlur(
          gray,
          dst,
          new window.cv.Size(5, 5),
          0,
          0,
          window.cv.BORDER_DEFAULT,
        );
        window.cv.cvtColor(dst, dst, window.cv.COLOR_GRAY2RGBA, 0);
        gray.delete();
        break;
      }
      case 'removeBackground': {
        const gray = new window.cv.Mat();
        window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY, 0);
        const thr = new window.cv.Mat();
        window.cv.adaptiveThreshold(
          gray,
          thr,
          255,
          window.cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          window.cv.THRESH_BINARY,
          11,
          2,
        );
        window.cv.bitwise_not(thr, thr);
        window.cv.cvtColor(thr, dst, window.cv.COLOR_GRAY2RGBA, 0);
        gray.delete();
        thr.delete();
        break;
      }
      default: {
        src.delete();
        dst.delete();
        return;
      }
    }

    window.cv.imshow(canvas, dst);
    const newUrl = canvas.toDataURL();
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        dispatch({
          type: 'SET_ORIGINAL_IMAGE',
          payload: { originalImage: img },
        });
        resolve();
      };
      img.onerror = reject;
      img.src = newUrl;
    });

    src.delete();
    dst.delete();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('OpenCV processing failed:', e);
  }
}

export default processImageWithThreshold;

