// What may be uploaded as a photo. Shared by the browser, for an instant answer, and the server,
// which must check again because anything can be sent to it.

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const PHOTO_TYPES = "image/jpeg,image/png,image/webp";

const startsWith = (bytes: Uint8Array, signature: number[], at = 0) =>
  signature.every((byte, i) => bytes[at + i] === byte);

/** The real format, from the file's own bytes. SVG is refused on purpose: it can carry scripts. */
export function detectImageType(bytes: Uint8Array) {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  const riff = [0x52, 0x49, 0x46, 0x46];
  const webp = [0x57, 0x45, 0x42, 0x50];
  if (startsWith(bytes, riff) && startsWith(bytes, webp, 8)) return "image/webp";
  return null;
}

export async function checkPhoto(file: File) {
  if (file.size > MAX_PHOTO_BYTES) return { error: "Please choose an image under 4 MB." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return { error: "Please choose a JPG, PNG or WebP image." };
  return { bytes, type };
}
