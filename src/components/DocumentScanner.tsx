import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Camera, RotateCcw, Trash2, Plus, FileDown, X,
  FlipHorizontal, ZoomIn, Loader2, ScanLine,
} from "lucide-react";
import jsPDF from "jspdf";

interface DocumentScannerProps {
  onPdfReady: (file: File) => void;
}

const DocumentScanner = ({ onPdfReady }: DocumentScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      toast({ title: "Camera access denied", description: "Please allow camera permissions to use the scanner.", variant: "destructive" });
    }
  }, [facingMode, toast]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  }, []);

  const openScanner = async () => {
    setIsOpen(true);
    await startCamera();
  };

  const closeScanner = () => {
    stopCamera();
    setIsOpen(false);
  };

  const toggleCamera = async () => {
    setFacingMode(f => f === "environment" ? "user" : "environment");
    // Camera will restart with new facing mode
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 200);
    }
  };

  const capturePage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    // Apply slight contrast enhancement for document readability
    ctx.filter = "contrast(1.15) brightness(1.05)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPages(prev => [...prev, dataUrl]);

    setTimeout(() => setCapturing(false), 300);
    toast({ title: `Page ${pages.length + 1} captured`, description: "Tap capture again or generate PDF." });
  };

  const removePage = (index: number) => {
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const generatePdf = async () => {
    if (!pages.length) return;
    setGenerating(true);

    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const pageHeight = 297;

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        // Load image to get dimensions
        const img = new Image();
        img.src = pages[i];
        await new Promise<void>((resolve) => { img.onload = () => resolve(); });

        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;

        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (imgRatio > pageRatio) {
          drawW = pageWidth;
          drawH = pageWidth / imgRatio;
          drawX = 0;
          drawY = (pageHeight - drawH) / 2;
        } else {
          drawH = pageHeight;
          drawW = pageHeight * imgRatio;
          drawX = (pageWidth - drawW) / 2;
          drawY = 0;
        }

        pdf.addImage(pages[i], "JPEG", drawX, drawY, drawW, drawH);
      }

      const blob = pdf.output("blob");
      const file = new File([blob], `scanned-document-${Date.now()}.pdf`, { type: "application/pdf" });

      onPdfReady(file);
      toast({ title: "PDF generated!", description: `${pages.length} page(s) compiled into PDF.` });

      setPages([]);
      closeScanner();
    } catch (err) {
      toast({ title: "PDF generation failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={openScanner} className="gap-2 w-full border-dashed border-2 h-auto py-4">
        <ScanLine className="h-6 w-6 text-primary" />
        <div className="text-left">
          <p className="font-medium">Scan Document</p>
          <p className="text-xs text-muted-foreground">Use camera to scan book pages into PDF</p>
        </div>
      </Button>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScanLine className="h-5 w-5 text-primary" /> Document Scanner
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={closeScanner}><X className="h-4 w-4" /></Button>
        </div>
        <CardDescription>Capture pages with your camera, then generate a PDF.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera viewfinder */}
        <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] max-h-[400px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Scan guide overlay */}
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
          </div>

          {capturing && (
            <div className="absolute inset-0 bg-white/50 animate-pulse" />
          )}

          {/* Page count badge */}
          {pages.length > 0 && (
            <Badge className="absolute top-2 right-2 bg-primary">{pages.length} page{pages.length > 1 ? "s" : ""}</Badge>
          )}
        </div>

        {/* Camera controls */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={toggleCamera} title="Flip camera">
            <FlipHorizontal className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            onClick={capturePage}
            disabled={!isCameraActive || capturing}
            className="rounded-full h-16 w-16 p-0"
          >
            <Camera className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => { setPages([]); }}
            disabled={pages.length === 0}
            title="Clear all pages"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Captured pages thumbnails */}
        {pages.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Captured Pages</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pages.map((page, i) => (
                <div key={i} className="relative shrink-0 group">
                  <img
                    src={page}
                    alt={`Page ${i + 1}`}
                    className="h-20 w-16 object-cover rounded border"
                  />
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/60 text-white py-0.5 rounded-b">
                    {i + 1}
                  </span>
                  <button
                    onClick={() => removePage(i)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <Button onClick={generatePdf} disabled={generating} className="w-full gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              {generating ? "Generating PDF..." : `Generate PDF (${pages.length} pages)`}
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};

export default DocumentScanner;
