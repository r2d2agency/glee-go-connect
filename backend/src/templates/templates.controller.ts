import { Controller, Get } from '@nestjs/common';

export const BIO_TEMPLATES = [
  { id: 'midnight', name: 'Midnight', description: 'Azul profundo com brilho neon — estilo Glee-go.', primaryColor: '#2563EB', accentColor: '#3B82F6', bgColor: '#0A0F1F', dark: true },
  { id: 'minimal', name: 'Minimal', description: 'Branco limpo, foco no conteúdo.', primaryColor: '#0F172A', accentColor: '#1E40AF', bgColor: '#FFFFFF', dark: false },
  { id: 'noir', name: 'Noir', description: 'Preto absoluto com detalhes em ouro.', primaryColor: '#C9A84C', accentColor: '#F0D78C', bgColor: '#0A0A0A', dark: true },
  { id: 'sunset', name: 'Sunset', description: 'Gradiente coral e magenta vibrante.', primaryColor: '#FF6B35', accentColor: '#E84393', bgColor: '#1A0B1F', dark: true },
  { id: 'forest', name: 'Forest', description: 'Verdes profundos, orgânico e calmo.', primaryColor: '#10B981', accentColor: '#5A8A5C', bgColor: '#0E1F17', dark: true },
  { id: 'cloud', name: 'Cloud', description: 'Azul SaaS suave, leve e aéreo.', primaryColor: '#3B82F6', accentColor: '#0EA5E9', bgColor: '#F8FAFC', dark: false },
];

@Controller('templates')
export class TemplatesController {
  @Get()
  list() {
    return BIO_TEMPLATES;
  }
}