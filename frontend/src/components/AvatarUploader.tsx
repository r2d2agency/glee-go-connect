'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/api';
import { humanizeError } from '@/lib/errors';

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  size?: number;
  shape?: 'circle' | 'rounded';
};

export function AvatarUploader({ value, onChange, label = 'Foto de perfil', size = 96, shape = 'circle' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }
    setBusy(true);
    try {
      const { url } = await uploadFile(file);
      onChange(url);
      toast.success('Foto enviada!');
    } catch (e) {
      toast.error(humanizeError(e, 'Falha ao enviar imagem.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && <span className="text-xs font-medium text-slate-600 block">{label}</span>}
      <div className="flex items-center gap-3">
        <div
          className={`${shape === 'circle' ? 'rounded-full' : 'rounded-2xl'} bg-slate-100 border overflow-hidden shrink-0 grid place-items-center text-slate-400`}
          style={{ width: size, height: size }}
        >
          {value
            ? <img src={value} alt="" className="w-full h-full object-contain" style={{ objectPosition: 'center' }} />
            : <span className="text-xs">Sem foto</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {busy ? 'Enviando...' : value ? 'Trocar foto' : 'Enviar foto'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-slate-500 hover:text-red-600 text-left"
            >
              Remover
            </button>
          )}
          <span className="text-[11px] text-slate-400">JPG, PNG, WEBP — até 5MB</span>
        </div>
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