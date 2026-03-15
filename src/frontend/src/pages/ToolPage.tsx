import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { colorClasses, getCategoryForTool, getToolById } from "@/data/tools";
import {
  compressImage,
  convertImageFormat,
  cropImage,
  resizeImage,
} from "@/lib/imageProcessor";
import {
  addPageNumbers,
  addWatermark,
  compressPDF,
  extractPages,
  mergePDFs,
  removePages,
  rotatePDF,
  splitPDF,
} from "@/lib/pdfProcessor";
import { useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type ProcessState = "idle" | "processing" | "done" | "error" | "coming-soon";

const PDFJS_VERSION = "4.4.168";

/** Load pdf.js from CDN and return the global pdfjsLib object */
function loadPdfJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (!lib) {
        reject(new Error("pdfjsLib not found after loading script"));
        return;
      }
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
      resolve(lib);
    };
    script.onerror = () => reject(new Error("Failed to load pdf.js from CDN"));
    document.head.appendChild(script);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    html: "text/html",
    txt: "text/plain",
    zip: "application/zip",
  };
  return mimeMap[ext ?? ""] ?? "application/octet-stream";
}

function downloadBlob(data: Uint8Array | Blob, filename: string) {
  const mimeType =
    data instanceof Blob
      ? data.type || getMimeType(filename)
      : getMimeType(filename);
  const blob =
    data instanceof Blob
      ? data
      : new Blob([data as BlobPart], { type: mimeType });
  const typedBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
  const url = URL.createObjectURL(typedBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Tools that genuinely require server-side processing — show "coming soon"
const comingSoonTools = [
  "word-to-pdf",
  "ppt-to-pdf",
  "excel-to-pdf",
  "pdf-to-word",
  "pdf-to-ppt",
  "pdf-to-excel",
  "pdf-to-pdfa",
  "ocr-pdf",
  "edit-annotations",
  "scan-to-pdf",
];

export function ToolPage() {
  const { toolId } = useParams({ strict: false }) as { toolId?: string };
  const tool = getToolById(toolId ?? "");
  const category = getCategoryForTool(toolId ?? "");
  const colors = category ? colorClasses[category.color] : colorClasses.blue;

  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [progress, setProgress] = useState(0);
  const [resultData, setResultData] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [resultBlob, setResultBlob] = useState<Uint8Array | Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rotateAngle, setRotateAngle] = useState<string>("90");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [pageNumbers, setPageNumbers] = useState("");
  const [quality, setQuality] = useState(80);
  const [resizeWidth, setResizeWidth] = useState("");
  const [resizeHeight, setResizeHeight] = useState("");
  const [cropX, setCropX] = useState("");
  const [cropY, setCropY] = useState("");
  const [cropW, setCropW] = useState("");
  const [cropH, setCropH] = useState("");
  // crop-pdf margin inputs (0-100 percent)
  const [pdfMarginLeft, setPdfMarginLeft] = useState("0");
  const [pdfMarginTop, setPdfMarginTop] = useState("0");
  const [pdfMarginRight, setPdfMarginRight] = useState("0");
  const [pdfMarginBottom, setPdfMarginBottom] = useState("0");
  // reorder-pages
  const [pageOrder, setPageOrder] = useState("");

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return;
      const arr = Array.from(incoming);
      setFiles(tool?.multiple ? arr : [arr[0]]);
      setState("idle");
      setResultData(null);
      setResultBlob(null);
    },
    [tool],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const triggerFileInput = () => fileInputRef.current?.click();

  const simulateProgress = (duration = 1800): Promise<void> =>
    new Promise((resolve) => {
      setProgress(0);
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const pct = Math.min((elapsed / duration) * 100, 95);
        setProgress(Math.round(pct));
        if (elapsed < duration) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });

  const processFile = async () => {
    if (files.length === 0) {
      toast.error("Please select a file first");
      return;
    }

    // Coming-soon tools — show friendly info, no fake error
    if (comingSoonTools.includes(toolId ?? "")) {
      setState("coming-soon");
      return;
    }

    setState("processing");
    setProgress(0);

    try {
      let result: Uint8Array | Blob | null = null;
      let outputName = "output";
      const file = files[0];
      const progressPromise = simulateProgress(1600);

      switch (toolId) {
        // ── PDF → JPG ──────────────────────────────────────────────────────
        case "pdf-to-jpg": {
          const pdfjsLib = await loadPdfJs();
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const blobs: Blob[] = [];

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Could not get canvas context");
            await page.render({ canvasContext: ctx, viewport }).promise;
            const blob = await new Promise<Blob>((res, rej) =>
              canvas.toBlob(
                (b) => (b ? res(b) : rej(new Error("Blob conversion failed"))),
                "image/jpeg",
                0.92,
              ),
            );
            blobs.push(blob);
          }

          await progressPromise;
          setProgress(100);

          if (blobs.length === 1) {
            setResultData({ name: "page-1.jpg", size: blobs[0].size });
            setResultBlob(blobs[0]);
            setState("done");
            toast.success("File processed successfully!");
          } else {
            for (let i = 0; i < blobs.length; i++) {
              downloadBlob(blobs[i], `page-${i + 1}.jpg`);
            }
            setState("done");
            setResultData({
              name: `${blobs.length} JPG images downloaded`,
              size: blobs.reduce((a, b) => a + b.size, 0),
            });
            toast.success("All pages downloaded as JPGs!");
          }
          return;
        }

        // ── Repair PDF ─────────────────────────────────────────────────────
        case "repair-pdf": {
          const { PDFDocument } = await import("pdf-lib");
          const bytes = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(bytes, {
            ignoreEncryption: true,
          });
          result = await pdfDoc.save();
          outputName = file.name.replace(/\.pdf$/i, "-repaired.pdf");
          break;
        }

        // ── Crop PDF ───────────────────────────────────────────────────────
        case "crop-pdf": {
          const { PDFDocument } = await import("pdf-lib");
          const bytes = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(bytes);
          const marginL = (Number.parseFloat(pdfMarginLeft) || 0) / 100;
          const marginT = (Number.parseFloat(pdfMarginTop) || 0) / 100;
          const marginR = (Number.parseFloat(pdfMarginRight) || 0) / 100;
          const marginB = (Number.parseFloat(pdfMarginBottom) || 0) / 100;

          for (const page of pdfDoc.getPages()) {
            const { width, height } = page.getSize();
            const x = width * marginL;
            const y = height * marginB;
            const w = width * (1 - marginL - marginR);
            const h = height * (1 - marginT - marginB);
            page.setMediaBox(x, y, w, h);
            page.setCropBox(x, y, w, h);
          }

          result = await pdfDoc.save();
          outputName = file.name.replace(/\.pdf$/i, "-cropped.pdf");
          break;
        }

        // ── Reorder Pages ──────────────────────────────────────────────────
        case "reorder-pages": {
          const { PDFDocument } = await import("pdf-lib");
          const bytes = await file.arrayBuffer();
          const srcDoc = await PDFDocument.load(bytes);
          const totalPages = srcDoc.getPageCount();

          const orderInput = pageOrder.trim();
          const indices = orderInput
            ? orderInput
                .split(",")
                .map((s) => Number.parseInt(s.trim()) - 1) // 1-based → 0-based
                .filter((n) => !Number.isNaN(n) && n >= 0 && n < totalPages)
            : Array.from({ length: totalPages }, (_, i) => i);

          const newDoc = await PDFDocument.create();
          const copied = await newDoc.copyPages(srcDoc, indices);
          for (const page of copied) newDoc.addPage(page);

          result = await newDoc.save();
          outputName = file.name.replace(/\.pdf$/i, "-reordered.pdf");
          break;
        }

        // ── HTML → PDF ─────────────────────────────────────────────────────
        case "html-to-pdf": {
          const htmlText = await file.text();
          const printWindow = window.open("", "_blank");
          if (!printWindow)
            throw new Error(
              "Popup blocked — please allow popups for this site",
            );
          printWindow.document.write(htmlText);
          printWindow.document.close();
          await new Promise((r) => setTimeout(r, 800));
          printWindow.print();
          await progressPromise;
          setProgress(100);
          setState("done");
          setResultData({
            name: "Use browser Save as PDF in print dialog",
            size: 0,
          });
          toast.success("Print dialog opened — choose 'Save as PDF'");
          return;
        }

        // ── Existing browser-side tools ────────────────────────────────────
        case "jpg-to-pdf": {
          const { PDFDocument } = await import("pdf-lib");
          const pdfDoc = await PDFDocument.create();
          for (const f of files) {
            const imgBytes = await f.arrayBuffer();
            const img =
              f.type === "image/png"
                ? await pdfDoc.embedPng(imgBytes)
                : await pdfDoc.embedJpg(imgBytes);
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, {
              x: 0,
              y: 0,
              width: img.width,
              height: img.height,
            });
          }
          result = await pdfDoc.save();
          outputName = "converted.pdf";
          break;
        }
        case "merge-pdf":
          result = await mergePDFs(files);
          outputName = "merged.pdf";
          break;
        case "split-pdf": {
          const parts = await splitPDF(file);
          if (parts.length === 1) {
            result = parts[0];
            outputName = "page-1.pdf";
          } else {
            await progressPromise;
            setProgress(100);
            for (let i = 0; i < parts.length; i++) {
              downloadBlob(parts[i], `page-${i + 1}.pdf`);
            }
            setState("done");
            setResultData({
              name: `${parts.length} pages extracted`,
              size: parts.reduce((a, p) => a + p.length, 0),
            });
            return;
          }
          break;
        }
        case "rotate-pdf":
          result = await rotatePDF(file, Number.parseInt(rotateAngle));
          outputName = "rotated.pdf";
          break;
        case "add-page-numbers":
          result = await addPageNumbers(file);
          outputName = "numbered.pdf";
          break;
        case "add-watermark":
          result = await addWatermark(file, watermarkText || "WATERMARK");
          outputName = "watermarked.pdf";
          break;
        case "remove-pages": {
          const nums = pageNumbers
            .split(",")
            .map((s) => Number.parseInt(s.trim()))
            .filter((n) => !Number.isNaN(n));
          result = await removePages(file, nums);
          outputName = "modified.pdf";
          break;
        }
        case "extract-pages": {
          const nums = pageNumbers
            .split(",")
            .map((s) => Number.parseInt(s.trim()))
            .filter((n) => !Number.isNaN(n));
          result = await extractPages(file, nums);
          outputName = "extracted.pdf";
          break;
        }
        case "compress-pdf":
          result = await compressPDF(file);
          outputName = "compressed.pdf";
          break;
        case "compress-image":
          result = await compressImage(file, quality);
          outputName = file.name.replace(/\.[^.]+$/, ".jpg");
          break;
        case "resize-image": {
          const w = Number.parseInt(resizeWidth) || 800;
          const h = Number.parseInt(resizeHeight) || 600;
          result = await resizeImage(file, w, h);
          outputName = file.name.replace(/\.[^.]+$/, "-resized.jpg");
          break;
        }
        case "png-to-jpg":
          result = await convertImageFormat(file, "jpeg");
          outputName = file.name.replace(/\.png$/i, ".jpg");
          break;
        case "jpg-to-png":
          result = await convertImageFormat(file, "png");
          outputName = file.name.replace(/\.(jpg|jpeg)$/i, ".png");
          break;
        case "crop-image": {
          const sx = Number.parseInt(cropX) || 0;
          const sy = Number.parseInt(cropY) || 0;
          const sw = Number.parseInt(cropW) || 100;
          const sh = Number.parseInt(cropH) || 100;
          result = await cropImage(file, sx, sy, sw, sh);
          outputName = file.name.replace(/\.[^.]+$/, "-cropped.jpg");
          break;
        }
        default:
          // Unknown tool — show coming-soon instead of error
          setState("coming-soon");
          setProgress(0);
          return;
      }

      await progressPromise;
      setProgress(100);

      if (result) {
        const size =
          result instanceof Blob ? result.size : (result as Uint8Array).length;
        setResultData({ name: outputName, size });
        setResultBlob(result);
        setState("done");
        toast.success("File processed successfully!");
      }
    } catch (err) {
      setProgress(100);
      setState("error");
      toast.error(err instanceof Error ? err.message : "Processing failed");
    }
  };

  const reset = () => {
    setFiles([]);
    setState("idle");
    setProgress(0);
    setResultData(null);
    setResultBlob(null);
  };

  if (!tool) {
    return (
      <div className="page-container">
        <AppHeader title="Tool Not Found" showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Tool not found</p>
        </div>
      </div>
    );
  }

  const Icon = tool.icon;

  const renderOptions = () => {
    switch (toolId) {
      case "rotate-pdf":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rotation Angle</Label>
            <Select value={rotateAngle} onValueChange={setRotateAngle}>
              <SelectTrigger data-ocid="tool.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90° Clockwise</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">
                  270° (90° Counter-clockwise)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "add-watermark":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Watermark Text</Label>
            <Input
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="CONFIDENTIAL"
              data-ocid="tool.input"
            />
          </div>
        );
      case "remove-pages":
      case "extract-pages":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Page Numbers (comma-separated)
            </Label>
            <Input
              value={pageNumbers}
              onChange={(e) => setPageNumbers(e.target.value)}
              placeholder="e.g. 1, 3, 5"
              data-ocid="tool.input"
            />
          </div>
        );
      case "compress-image":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Quality</Label>
              <span className="text-sm text-muted-foreground">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        );
      case "resize-image":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Width (px)</Label>
              <Input
                value={resizeWidth}
                onChange={(e) => setResizeWidth(e.target.value)}
                placeholder="800"
                data-ocid="tool.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Height (px)</Label>
              <Input
                value={resizeHeight}
                onChange={(e) => setResizeHeight(e.target.value)}
                placeholder="600"
              />
            </div>
          </div>
        );
      case "crop-image":
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Crop Region (pixels)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">
                  X offset
                </Label>
                <Input
                  value={cropX}
                  onChange={(e) => setCropX(e.target.value)}
                  placeholder="0"
                  data-ocid="tool.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Y offset
                </Label>
                <Input
                  value={cropY}
                  onChange={(e) => setCropY(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  value={cropW}
                  onChange={(e) => setCropW(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  value={cropH}
                  onChange={(e) => setCropH(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        );
      case "crop-pdf":
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Crop Margins (% from edge)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Left %</Label>
                <Input
                  value={pdfMarginLeft}
                  onChange={(e) => setPdfMarginLeft(e.target.value)}
                  placeholder="0"
                  data-ocid="tool.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Top %</Label>
                <Input
                  value={pdfMarginTop}
                  onChange={(e) => setPdfMarginTop(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right %</Label>
                <Input
                  value={pdfMarginRight}
                  onChange={(e) => setPdfMarginRight(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Bottom %
                </Label>
                <Input
                  value={pdfMarginBottom}
                  onChange={(e) => setPdfMarginBottom(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        );
      case "reorder-pages":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">New Page Order</Label>
            <Input
              value={pageOrder}
              onChange={(e) => setPageOrder(e.target.value)}
              placeholder="e.g. 3, 1, 2"
              data-ocid="tool.input"
            />
            <p className="text-xs text-muted-foreground">
              Enter page numbers in desired order, comma-separated. Leave blank
              to keep original order.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const hasOptions = [
    "rotate-pdf",
    "add-watermark",
    "remove-pages",
    "extract-pages",
    "compress-image",
    "resize-image",
    "crop-image",
    "crop-pdf",
    "reorder-pages",
  ].includes(toolId ?? "");

  return (
    <div className="page-container">
      <AppHeader title={tool.name} showBack />
      <main className="px-4 pt-4 safe-bottom space-y-4">
        <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border card-shadow">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${colors.icon}`}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-semibold text-sm">{tool.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {tool.description}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state !== "done" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* biome-ignore lint/a11y/useSemanticElements: drop zone with nested interactive children cannot use button */}
              <div
                role="button"
                tabIndex={0}
                data-ocid="tool.dropzone"
                aria-label="Upload file drop zone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={triggerFileInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    triggerFileInput();
                  }
                }}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isDragging
                    ? `border-primary ${colors.bg}`
                    : files.length > 0
                      ? "border-border bg-secondary/30"
                      : "border-border bg-card hover:border-primary/50 hover:bg-secondary/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={tool.acceptedTypes}
                  multiple={tool.multiple}
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                {files.length > 0 ? (
                  <div className="space-y-2">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div className="font-medium text-sm">
                      {files.length === 1
                        ? files[0].name
                        : `${files.length} files selected`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {files.length === 1
                        ? formatBytes(files[0].size)
                        : files.map((f) => f.name).join(", ")}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      data-ocid="tool.upload_button"
                    >
                      Change file
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Select File</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or drag & drop here
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                      data-ocid="tool.upload_button"
                    >
                      Browse files
                    </Button>
                  </div>
                )}
              </div>

              {files.length > 0 && hasOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-4 border border-border card-shadow space-y-3"
                >
                  <h3 className="text-sm font-semibold">Options</h3>
                  {renderOptions()}
                </motion.div>
              )}

              {state === "processing" && (
                <motion.div
                  data-ocid="tool.loading_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-2xl p-4 border border-border card-shadow space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing...</span>
                    <span className="text-sm text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Please wait while your file is being processed
                  </p>
                </motion.div>
              )}

              {state === "coming-soon" && (
                <motion.div
                  data-ocid="tool.panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20 flex items-start gap-3"
                >
                  <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Coming Soon
                    </p>
                    <p className="text-xs text-blue-500/80 mt-0.5">
                      This feature is coming soon! We&apos;re working hard to
                      bring it to you.
                    </p>
                  </div>
                </motion.div>
              )}

              {state === "error" && (
                <motion.div
                  data-ocid="tool.error_state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-destructive/10 rounded-2xl p-4 border border-destructive/20 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Processing failed
                    </p>
                    <p className="text-xs text-destructive/70 mt-0.5">
                      Something went wrong. Please check your file and try
                      again.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs p-0 h-auto"
                      onClick={reset}
                    >
                      Try again
                    </Button>
                  </div>
                </motion.div>
              )}

              {state !== "processing" && (
                <Button
                  className="w-full h-12 text-sm font-semibold rounded-xl"
                  onClick={processFile}
                  disabled={files.length === 0}
                  data-ocid="tool.primary_button"
                >
                  Process File
                </Button>
              )}
            </motion.div>
          )}

          {state === "done" && resultData && (
            <motion.div
              key="result"
              data-ocid="tool.success_state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-2xl p-5 border border-border card-shadow text-center space-y-3">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-tint mx-auto">
                  <CheckCircle className="h-7 w-7 text-green-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Processing complete!</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {resultData.name}
                  </p>
                  {resultData.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(resultData.size)}
                    </p>
                  )}
                </div>
                {resultBlob && (
                  <Button
                    className="w-full h-11 font-semibold rounded-xl"
                    onClick={() =>
                      resultBlob && downloadBlob(resultBlob, resultData.name)
                    }
                    data-ocid="tool.primary_button"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl"
                  onClick={reset}
                  data-ocid="tool.secondary_button"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
