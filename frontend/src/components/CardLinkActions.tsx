'use client';
import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';

type Props = {
  url: string;
  filename?: string;
  brandColor?: string;
};

export function CardLinkActions({ url, filename = 'qrcode', brandColor = '#22d36a' }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  function download() {
    const canvas = wrapRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={copy}
          title="Copiar link"
          className="px-2 py-1 rounded text-xs border border-white/15 bg-white/5 hover:bg-white/10"
        >
          📋 Copiar
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="QR Code"
          className="px-2 py-1 rounded text-xs border border-white/15 bg-white/5 hover:bg-white/10"
        >
          🔳 QR
        </button>
      </div>

      {/* Hidden high-res canvas used for download */}
      <div ref={wrapRef} style={{ position: 'fixed', left: -9999, top: -9999 }} aria-hidden>
        <QRCodeCanvas
          value={url}
          size={1024}
          level="H"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#050a0d"
        />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[var(--ge-surface,#0b1117)] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-white text-lg mb-1">QR Code</h3>
            <p className="text-xs text-white/60 mb-4 break-all">{url}</p>
            <div className="mx-auto inline-block p-4 rounded-xl bg-white">
              <QRCodeCanvas
                value={url}
                size={240}
                level="H"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#050a0d"
              />
            </div>
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={download}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-black"
                style={{ background: brandColor }}
              >
                ⬇ Baixar PNG
              </button>
              <button
                onClick={copy}
                className="px-4 py-2 rounded-lg text-sm border border-white/15 text-white hover:bg-white/10"
              >
                📋 Copiar link
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border border-white/15 text-white hover:bg-white/10"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}