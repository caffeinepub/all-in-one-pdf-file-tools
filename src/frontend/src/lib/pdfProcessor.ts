import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    for (const p of pages) merged.addPage(p);
  }
  return merged.save();
}

export async function splitPDF(file: File): Promise<Uint8Array[]> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const results: Uint8Array[] = [];
  for (let i = 0; i < doc.getPageCount(); i++) {
    const newDoc = await PDFDocument.create();
    const [page] = await newDoc.copyPages(doc, [i]);
    newDoc.addPage(page);
    results.push(await newDoc.save());
  }
  return results;
}

export async function rotatePDF(
  file: File,
  angle: number,
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  for (const p of doc.getPages()) p.setRotation(degrees(angle));
  return doc.save();
}

export async function addPageNumbers(file: File): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    page.drawText(`${i + 1}`, {
      x: width / 2 - 6,
      y: 20,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }
  return doc.save();
}

export async function addWatermark(
  file: File,
  text: string,
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: 48,
      font,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.35,
      rotate: degrees(45),
    });
  }
  return doc.save();
}

export async function removePages(
  file: File,
  pagesToRemove: number[],
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const removeSet = new Set(pagesToRemove.map((n) => n - 1));
  const keepIndices = doc.getPageIndices().filter((i) => !removeSet.has(i));
  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(doc, keepIndices);
  for (const p of pages) newDoc.addPage(p);
  return newDoc.save();
}

export async function extractPages(
  file: File,
  pagesToExtract: number[],
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const indices = pagesToExtract
    .map((n) => n - 1)
    .filter((i) => i >= 0 && i < doc.getPageCount());
  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(doc, indices);
  for (const p of pages) newDoc.addPage(p);
  return newDoc.save();
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  return doc.save({ useObjectStreams: true });
}
