'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/api';
import { humanizeError } from '@/lib/errors';

type Props = {
  onUploaded: (urls: string[]) => void;
  label?: string;
};

export function GalleryMultiUploader({ onUploaded, label = 'Adicionar fotos' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  async function handleFiles(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) {
      toast.error('Selecione imagens.');
      return;
    }
    const tooBig = imgs.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      toast.error(`"${tooBig.name}" excede 5MB.`);
      return;
    }
    setBusy(true);
    setProgress({ done: 0, total: imgs.length });
    const urls: string[] = [];
    let failed = 0;
    for (const file of imgs) {
      try {
        const { url } = await uploadFile(file);
        urls.push(url);
      } catch (e) {
        failed++;
        toast.error(humanizeError(e, `Falha em ${file.name}`));
      } finally {
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    }
    if (urls.length) {
      onUploaded(urls);
      toast.success(`${urls.length} foto(s) enviada(s)${failed ? ` · ${failed} falha(s)` : ''}`);
    }
    setBusy(false);
    setProgress({ done: 0, total: 0 });
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2.5 text-sm rounded-lg bg-[var(--ge-green)] text-black font-medium hover:opacity-90 disabled:opacity-50"
      >
        {busy
          ? `Enviando ${progress.done}/${progress.total}...`
          : `⬆ ${label} (várias)`}
      </button>
      <p className="text-[11px] text-white/40 mt-1.5">JPG, PNG, WEBP — até 5MB cada · selecione várias de uma vez</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files ?? []);
          if (fs.length) handleFiles(fs);
          e.target.value = '';
        }}
      />
    </div>
  );
}