'use client';
import { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

type Props = {
  file: File;
  shape?: 'circle' | 'rounded' | 'square';
  aspect?: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

async function getCroppedBlob(src: string, area: Area, outputSize = 800): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outputSize, outputSize);
  return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92));
}

export function ImageCropModal({ file, shape = 'circle', aspect = 1, onCancel, onConfirm }: Props) {
  const [src] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [areaPx, setAreaPx] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, px: Area) => setAreaPx(px), []);

  async function handleConfirm() {
    if (!areaPx) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(src, areaPx, 800);
      URL.revokeObjectURL(src);
      onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 grid place-items-center p-4" onClick={onCancel}>
      <div className="bg-[#0a1014] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-semibold">Ajustar imagem</h3>
          <button onClick={onCancel} className="text-white/60 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="relative bg-black" style={{ height: 360 }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={shape === 'circle' ? 'round' : 'rect'}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onComplete}
          />
        </div>
        <div className="p-4 space-y-3">
          <label className="block">
            <span className="text-xs text-white/60">Zoom</span>
            <input type="range" min={1} max={4} step={0.01} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-emerald-400" />
          </label>
          <label className="block">
            <span className="text-xs text-white/60">Rotação</span>
            <input type="range" min={0} max={360} step={1} value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-emerald-400" />
          </label>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-white/15 text-white/80 hover:bg-white/5">Cancelar</button>
            <button onClick={handleConfirm} disabled={busy || !areaPx}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 disabled:opacity-50">
              {busy ? 'Processando...' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}