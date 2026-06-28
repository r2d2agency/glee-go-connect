'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/api';
import { humanizeError } from '@/lib/errors';

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
};

export function BannerUploader({ value, onChange, label = 'Imagem do banner' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 8MB.');
      return;
    }
    setBusy(true);
    try {
      const { url } = await uploadFile(file);
      onChange(url);
      toast.success('Banner enviado!');
    } catch (e) {
      toast.error(humanizeError(e, 'Falha ao enviar imagem.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && <span className="text-xs font-medium text-white/70 block">{label}</span>}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40">
          <img src={value} alt="banner" className="w-full h-auto block" />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/15 bg-black/30 aspect-[8/3] grid place-items-center text-white/40 text-sm">
          Sem imagem
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 text-sm rounded-lg bg-[var(--ge-green)] text-black font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Enviando...' : value ? 'Trocar imagem' : 'Enviar imagem'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-white/60 hover:text-red-400"
          >
            Remover
          </button>
        )}
        <span className="text-[11px] text-white/40 ml-auto">JPG/PNG/WEBP — até 8MB. Ideal 1600×600.</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}