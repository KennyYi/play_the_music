export async function extractCoverArt(file: File): Promise<string | null> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  if (
    view.getUint8(0) === 0x49 &&
    view.getUint8(1) === 0x44 &&
    view.getUint8(2) === 0x33
  ) {
    const version = view.getUint8(3);
    const tagSize =
      ((view.getUint8(6) & 0x7f) << 21) |
      ((view.getUint8(7) & 0x7f) << 14) |
      ((view.getUint8(8) & 0x7f) << 7) |
      (view.getUint8(9) & 0x7f);
    let offset = 10;
    while (offset < tagSize + 10) {
      if (offset + 10 > view.byteLength) break;
      const frameId =
        String.fromCharCode(view.getUint8(offset)) +
        String.fromCharCode(view.getUint8(offset + 1)) +
        String.fromCharCode(view.getUint8(offset + 2)) +
        String.fromCharCode(view.getUint8(offset + 3));
      const frameSize =
        version === 4
          ? ((view.getUint8(offset + 4) & 0x7f) << 21) |
            ((view.getUint8(offset + 5) & 0x7f) << 14) |
            ((view.getUint8(offset + 6) & 0x7f) << 7) |
            (view.getUint8(offset + 7) & 0x7f)
          : view.getUint32(offset + 4);
      offset += 10;
      if (frameId === "APIC") {
        let i = offset;
        const encoding = view.getUint8(i);
        i += 1;
        let mime = "";
        while (i < offset + frameSize && view.getUint8(i) !== 0) {
          mime += String.fromCharCode(view.getUint8(i));
          i += 1;
        }
        i += 1;
        i += 1; // picture type
        const isUtf16 = encoding === 1 || encoding === 2;
        while (
          i < offset + frameSize &&
          !(view.getUint8(i) === 0 && (!isUtf16 || view.getUint8(i + 1) === 0))
        ) {
          i += 1;
          if (isUtf16) i += 1;
        }
        i += isUtf16 ? 2 : 1;
        const imageData = buffer.slice(i, offset + frameSize);
        const blob = new Blob([imageData], { type: mime || "image/jpeg" });
        return URL.createObjectURL(blob);
      } else {
        offset += frameSize;
      }
    }
  }
  return null;
}
