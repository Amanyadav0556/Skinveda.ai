// Shrinks a photo in the browser before it is stored or uploaded.
// Phone photos are 3–8 MB as base64; the API accepts up to ~1.5 MB.

const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not read this image'));
  img.src = src;
});

export const readFileAsDataURL = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = e => resolve(e.target.result);
  reader.onerror = () => reject(new Error('Could not read this file'));
  reader.readAsDataURL(file);
});

/**
 * Resize so the longest side is at most `maxSide` px and re-encode as JPEG.
 * Returns a data:image/jpeg URL (typically 60–200 KB).
 */
export async function compressImage(src, { maxSide = 1024, quality = 0.82 } = {}) {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // flatten transparent PNGs onto white
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export const compressFile = async (file, opts) => compressImage(await readFileAsDataURL(file), opts);
