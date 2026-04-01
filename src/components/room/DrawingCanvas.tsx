"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Check, Pen, Eraser, Undo } from "lucide-react";

export function DrawingCanvas({
  onSave,
  disabled,
}: {
  onSave: (blob: Blob) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set internal resolution based on CSS size correctly
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.width * 0.75; // aspect ratio 4:3
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#18181b"; // bg-zinc-900 essentially
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory(canvas);
    }
    
    // Resize handler could be added here if needed, but keeping it simple for now
  }, []);

  const saveToHistory = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = isEraser ? "#18181b" : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) saveToHistory(canvas);
    }
  };

  const handleUndo = () => {
    if (disabled || history.length <= 1) return;
    
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory.pop(); // remove current state
      const previousState = newHistory[newHistory.length - 1];
      
      const canvas = canvasRef.current;
      if (canvas && previousState) {
        const ctx = canvas.getContext("2d");
        ctx?.putImageData(previousState, 0, 0);
      }
      return newHistory;
    });
  };

  const handleClear = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory(canvas);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, "image/png");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full relative rounded-lg border-2 border-zinc-700 overflow-hidden bg-zinc-900 touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ touchAction: "none" }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-zinc-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              setIsEraser(false);
            }}
            disabled={disabled}
            className="w-8 h-8 rounded shrink-0 cursor-pointer bg-transparent border-0 p-0"
            title="Color Pick"
          />
          <Button
            size="icon"
            variant={isEraser ? "secondary" : "ghost"}
            onClick={() => setIsEraser(!isEraser)}
            disabled={disabled}
            title={isEraser ? "Pencil" : "Eraser"}
          >
            {isEraser ? <Pen className="h-4 w-4" /> : <Eraser className="h-4 w-4" />}
          </Button>
          <div className="h-8 w-px bg-zinc-700 mx-1" />
          <Button size="icon" variant="ghost" onClick={handleUndo} disabled={disabled || history.length <= 1} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleClear} disabled={disabled} title="Clear Canvas">
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>

        <Button onClick={handleSave} disabled={disabled} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Check className="h-4 w-4 mr-2" /> Finish Drawing
        </Button>
      </div>
    </div>
  );
}
