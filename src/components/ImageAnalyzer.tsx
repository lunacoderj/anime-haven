import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, Search, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ImageAnalyzer = () => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ title: string; confidence: number; id: number } | null>(null);
  const navigate = useNavigate();

  const handleFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => setPreview(r.result as string);
    r.readAsDataURL(f);
    setResult(null);
  };

  const analyze = () => {
    setAnalyzing(true);
    // Mock mapping for demo purposes
    const mockDb: Record<string, number> = {
        "Demon Slayer": 101922,
        "Attack on Titan": 16498,
        "One Piece": 21,
        "Jujutsu Kaisen": 113415
    };

    setTimeout(() => {
      const title = "Demon Slayer";
      setResult({ title, confidence: 92, id: mockDb[title] || 101922 });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-primary hover:bg-primary/80">
        <Camera className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Image Analyzer</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                className="mb-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag & drop an image or</p>
                    <label className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80">
                      Browse
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    </label>
                  </>
                )}
              </div>

              {preview && (
                <button onClick={analyze} disabled={analyzing} className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50">
                  {analyzing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Search className="h-4 w-4" />}
                  {analyzing ? "Analyzing..." : "Analyze"}
                </button>
              )}

              {result && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">Match: {result.title}</p>
                  <p className="text-xs text-muted-foreground">Confidence: {result.confidence}%</p>
                  <button 
                    onClick={() => { navigate(`/details/${result.id}`); setOpen(false); }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary/20 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" /> View Details
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageAnalyzer;
