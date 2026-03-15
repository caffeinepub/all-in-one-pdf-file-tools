import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Camera,
  Combine,
  Copy,
  Crop,
  Droplets,
  FileCheck,
  FileImage,
  FilePlus,
  FileText,
  FileType,
  Globe,
  GripVertical,
  Hash,
  Image,
  ImageDown,
  LayoutList,
  Maximize2,
  MessageSquare,
  PackageOpen,
  PenLine,
  Presentation,
  RotateCw,
  ScanText,
  Scissors,
  Table,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";

export type CategoryColor = "blue" | "purple" | "orange" | "green" | "pink";

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  acceptedTypes: string;
  multiple?: boolean;
}

export interface CategoryDef {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  color: CategoryColor;
  path: string;
  tools: ToolDef[];
}

const CONVERT_TOOLS: ToolDef[] = [
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "Convert JPG images into a PDF document",
    icon: FileImage,
    category: "convert",
    acceptedTypes: "image/jpeg,image/jpg,image/png",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents to PDF format",
    icon: FileText,
    category: "convert",
    acceptedTypes: ".doc,.docx,application/msword",
  },
  {
    id: "ppt-to-pdf",
    name: "PowerPoint to PDF",
    description: "Convert presentations to PDF",
    icon: Presentation,
    category: "convert",
    acceptedTypes: ".ppt,.pptx",
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Convert spreadsheets to PDF format",
    icon: Table,
    category: "convert",
    acceptedTypes: ".xls,.xlsx",
  },
  {
    id: "html-to-pdf",
    name: "HTML to PDF",
    description: "Convert web pages to PDF",
    icon: Globe,
    category: "convert",
    acceptedTypes: ".html,.htm,text/html",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Extract PDF pages as JPG images",
    icon: FileImage,
    category: "convert",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert PDF to editable Word document",
    icon: FileType,
    category: "convert",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "pdf-to-ppt",
    name: "PDF to PowerPoint",
    description: "Convert PDF slides to PowerPoint",
    icon: FilePlus,
    category: "convert",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "pdf-to-excel",
    name: "PDF to Excel",
    description: "Extract tables from PDF to Excel",
    icon: Table,
    category: "convert",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "pdf-to-pdfa",
    name: "PDF to PDF/A",
    description: "Convert PDF to archival PDF/A standard",
    icon: FileCheck,
    category: "convert",
    acceptedTypes: "application/pdf,.pdf",
  },
];

const EDIT_TOOLS: ToolDef[] = [
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate all PDF pages by 90°, 180°, or 270°",
    icon: RotateCw,
    category: "edit",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "add-page-numbers",
    name: "Add Page Numbers",
    description: "Add page numbers to every PDF page",
    icon: Hash,
    category: "edit",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "add-watermark",
    name: "Add Watermark",
    description: "Stamp a text watermark on all pages",
    icon: Droplets,
    category: "edit",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "crop-pdf",
    name: "Crop PDF",
    description: "Crop the visible area of PDF pages",
    icon: Crop,
    category: "edit",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "edit-annotations",
    name: "Edit Annotations",
    description: "Edit text and annotations in PDF",
    icon: MessageSquare,
    category: "edit",
    acceptedTypes: "application/pdf,.pdf",
  },
];

const ORGANIZE_TOOLS: ToolDef[] = [
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one file",
    icon: Combine,
    category: "organize",
    acceptedTypes: "application/pdf,.pdf",
    multiple: true,
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Split PDF into separate pages or ranges",
    icon: Scissors,
    category: "organize",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "remove-pages",
    name: "Remove Pages",
    description: "Delete specific pages from a PDF",
    icon: Trash2,
    category: "organize",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "extract-pages",
    name: "Extract Pages",
    description: "Extract specific pages into a new PDF",
    icon: Copy,
    category: "organize",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "reorder-pages",
    name: "Reorder Pages",
    description: "Drag and drop to reorder PDF pages",
    icon: GripVertical,
    category: "organize",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "scan-to-pdf",
    name: "Scan to PDF",
    description: "Use your camera to scan documents",
    icon: Camera,
    category: "organize",
    acceptedTypes: "image/*",
  },
];

const OPTIMIZE_TOOLS: ToolDef[] = [
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while preserving quality",
    icon: PackageOpen,
    category: "optimize",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "repair-pdf",
    name: "Repair PDF",
    description: "Fix and recover damaged PDF files",
    icon: Wrench,
    category: "optimize",
    acceptedTypes: "application/pdf,.pdf",
  },
  {
    id: "ocr-pdf",
    name: "OCR PDF",
    description: "Extract text from scanned PDFs and images",
    icon: ScanText,
    category: "optimize",
    acceptedTypes: "application/pdf,.pdf,image/*",
  },
];

const IMAGE_TOOLS: ToolDef[] = [
  {
    id: "compress-image",
    name: "Compress Image",
    description: "Reduce image file size with quality control",
    icon: ImageDown,
    category: "images",
    acceptedTypes: "image/*",
  },
  {
    id: "resize-image",
    name: "Resize Image",
    description: "Change image dimensions to any size",
    icon: Maximize2,
    category: "images",
    acceptedTypes: "image/*",
  },
  {
    id: "png-to-jpg",
    name: "PNG to JPG",
    description: "Convert PNG images to JPEG format",
    icon: FileImage,
    category: "images",
    acceptedTypes: "image/png",
  },
  {
    id: "jpg-to-png",
    name: "JPG to PNG",
    description: "Convert JPEG images to PNG format",
    icon: FileImage,
    category: "images",
    acceptedTypes: "image/jpeg,image/jpg",
  },
  {
    id: "crop-image",
    name: "Crop Image",
    description: "Crop images to your desired dimensions",
    icon: Crop,
    category: "images",
    acceptedTypes: "image/*",
  },
];

export const CATEGORIES: CategoryDef[] = [
  {
    id: "convert",
    name: "Convert Files",
    subtitle: "Transform between formats",
    icon: ArrowLeftRight,
    color: "blue",
    path: "/convert",
    tools: CONVERT_TOOLS,
  },
  {
    id: "edit",
    name: "Edit PDF",
    subtitle: "Modify your PDF content",
    icon: PenLine,
    color: "purple",
    path: "/edit",
    tools: EDIT_TOOLS,
  },
  {
    id: "organize",
    name: "Organize PDF",
    subtitle: "Merge, split, and reorder",
    icon: LayoutList,
    color: "orange",
    path: "/organize",
    tools: ORGANIZE_TOOLS,
  },
  {
    id: "optimize",
    name: "Optimize PDF",
    subtitle: "Compress and enhance",
    icon: Zap,
    color: "green",
    path: "/optimize",
    tools: OPTIMIZE_TOOLS,
  },
  {
    id: "images",
    name: "Image Tools",
    subtitle: "Edit and convert images",
    icon: Image,
    color: "pink",
    path: "/images",
    tools: IMAGE_TOOLS,
  },
];

export const ALL_TOOLS: ToolDef[] = [
  ...CONVERT_TOOLS,
  ...EDIT_TOOLS,
  ...ORGANIZE_TOOLS,
  ...OPTIMIZE_TOOLS,
  ...IMAGE_TOOLS,
];

export function getToolById(id: string): ToolDef | undefined {
  return ALL_TOOLS.find((t) => t.id === id);
}

export function getCategoryForTool(toolId: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.tools.some((t) => t.id === toolId));
}

export const colorClasses: Record<
  CategoryColor,
  { icon: string; bg: string; text: string; border: string }
> = {
  blue: {
    icon: "bg-blue-tint text-blue-accent",
    bg: "bg-blue-tint",
    text: "text-blue-accent",
    border: "border-blue-accent/30",
  },
  purple: {
    icon: "bg-purple-tint text-purple-accent",
    bg: "bg-purple-tint",
    text: "text-purple-accent",
    border: "border-purple-accent/30",
  },
  orange: {
    icon: "bg-orange-tint text-orange-accent",
    bg: "bg-orange-tint",
    text: "text-orange-accent",
    border: "border-orange-accent/30",
  },
  green: {
    icon: "bg-green-tint text-green-accent",
    bg: "bg-green-tint",
    text: "text-green-accent",
    border: "border-green-accent/30",
  },
  pink: {
    icon: "bg-pink-tint text-pink-accent",
    bg: "bg-pink-tint",
    text: "text-pink-accent",
    border: "border-pink-accent/30",
  },
};
