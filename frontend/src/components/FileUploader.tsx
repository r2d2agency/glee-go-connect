'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadAnyFile } from '@/lib/api';
import { humanizeError } from '@/lib/errors';

type Props = {
  value?: string | null;
  fileName?: string | null;
  onChange: (data: { url: string; fileName: string } | null) => void;
  label?: string;
  accept?: string;
};

function prettySize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploader({ value, fileName, onChange, label = 'Arquivo (PDF, EPUB, ZIP...)', accept }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx. 50MB).');
      return;
    }
    setBusy(true);
    try {
      const r = await uploadAnyFile(file);
      onChange({ url: r.url, fileName: r.originalName || file.name });
      toast.success(`Arquivo enviado (${prettySize(r.size)})`);
    } catch (e) {
      toast.error(humanizeError(e, 'Falha ao enviar arquivo.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <span className="text-xs font-medium text-white/60 block">{label}</span>}
      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[var(--ge-green)]">📎</span>
            <a href={value} target="_blank" rel="noreferrer" className="text-sm truncate hover:underline">
              {fileName || 'arquivo.bin'}
            </a>
          </div>
          <button type="button" onClick={() => onChange(null)} className="text-xs text-red-400 hover:text-red-300">
            Remover
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-full px-3 py-2 text-sm rounded-lg border border-dashed border-white/20 bg-white/[.02] hover:bg-white/[.05] disabled:opacity-50 text-white/70"
        >
          {busy ? 'Enviando...' : '⬆ Enviar arquivo (até 50MB)'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
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