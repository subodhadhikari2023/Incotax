// @vitest-environment node
import { describe, expect, it } from "vitest";

import { checkPhoto, detectImageType, MAX_PHOTO_BYTES } from "./photo";

const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");
const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>');

const file = (bytes: Uint8Array, name = "photo.png", type = "image/png") =>
  new File([bytes.slice()], name, { type });

describe("detectImageType", () => {
  it("recognises the allowed formats from the file's own bytes", () => {
    expect(detectImageType(png)).toBe("image/png");
    expect(detectImageType(jpeg)).toBe("image/jpeg");
    expect(detectImageType(webp)).toBe("image/webp");
  });

  it("recognises nothing else", () => {
    expect(detectImageType(svg)).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});

describe("checkPhoto", () => {
  it("accepts an allowed image", async () => {
    const result = await checkPhoto(file(png));
    expect(result).toMatchObject({ type: "image/png" });
  });

  // A file's name and declared type come from the browser, so neither can be trusted.
  it("refuses an SVG or anything else dressed up as an image", async () => {
    expect(await checkPhoto(file(svg, "photo.png", "image/png"))).toEqual({
      error: expect.stringMatching(/JPG, PNG or WebP/),
    });
  });

  it("refuses a file over the size limit", async () => {
    const big = new Uint8Array(MAX_PHOTO_BYTES + 1);
    big.set(png);
    expect(await checkPhoto(file(big))).toEqual({ error: expect.stringMatching(/4 MB/) });
  });

  it("accepts a file exactly at the limit", async () => {
    const exact = new Uint8Array(MAX_PHOTO_BYTES);
    exact.set(png);
    expect(await checkPhoto(file(exact))).toMatchObject({ type: "image/png" });
  });
});
