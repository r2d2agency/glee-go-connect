import { Controller, Get } from '@nestjs/common';

export const BIO_TEMPLATES = [
  { id: 'midnight', name: 'Midnight', description: 'Azul profundo com brilho neon — estilo Glee-go.', primaryColor: '#2563EB', accentColor: '#3B82F6', bgColor: '#0A0F1F', dark: true },
  { id: 'minimal', name: 'Minimal', description: 'Branco limpo, foco no conteúdo.', primaryColor: '#0F172A', accentColor: '#1E40AF', bgColor: '#FFFFFF', dark: false },
  { id: 'noir', name: 'Noir', description: 'Preto absoluto com detalhes em ouro.', primaryColor: '#C9A84C', accentColor: '#F0D78C', bgColor: '#0A0A0A', dark: true },
  { id: 'sunset', name: 'Sunset', description: 'Gradiente coral e magenta vibrante.', primaryColor: '#FF6B35', accentColor: '#E84393', bgColor: '#1A0B1F', dark: true },
  { id: 'forest', name: 'Forest', description: 'Verdes profundos, orgânico e calmo.', primaryColor: '#10B981', accentColor: '#5A8A5C', bgColor: '#0E1F17', dark: true },
  { id: 'cloud', name: 'Cloud', description: 'Azul SaaS suave, leve e aéreo.', primaryColor: '#3B82F6', accentColor: '#0EA5E9', bgColor: '#F8FAFC', dark: false },
  // Templates por segmento
  { id: 'tech', name: 'Tecnologia', description: 'Dark futurista com verde neon — devs, SaaS e startups.', primaryColor: '#22D36A', accentColor: '#00E0FF', bgColor: '#050A0D', dark: true, industry: 'tecnologia' },
  { id: 'law', name: 'Advocacia', description: 'Sóbrio, navy e dourado — autoridade e confiança.', primaryColor: '#C9A84C', accentColor: '#1E3A5F', bgColor: '#0F1B2D', dark: true, industry: 'advocacia' },
  { id: 'mentor', name: 'Mentoria', description: 'Roxo profundo e dourado — alta performance.', primaryColor: '#8B5CF6', accentColor: '#F0C674', bgColor: '#13091F', dark: true, industry: 'mentoria' },
  { id: 'agency', name: 'Agência de Marketing', description: 'Magenta e laranja vibrante — energia criativa.', primaryColor: '#E84393', accentColor: '#FF6B35', bgColor: '#0F0A1A', dark: true, industry: 'marketing' },
  { id: 'consulting', name: 'Consultoria', description: 'Azul corporativo e cinza — clareza estratégica.', primaryColor: '#1E40AF', accentColor: '#64748B', bgColor: '#F8FAFC', dark: false, industry: 'consultoria' },
  { id: 'aesthetics', name: 'Estética', description: 'Rosé gold e nude — feminino e sofisticado.', primaryColor: '#D4A5A5', accentColor: '#B76E79', bgColor: '#1A0F12', dark: true, industry: 'estetica' },
  { id: 'dental', name: 'Odontologia', description: 'Branco clínico com azul ciano — limpeza e cuidado.', primaryColor: '#0EA5E9', accentColor: '#06B6D4', bgColor: '#F0F9FF', dark: false, industry: 'odontologia' },
];

@Controller('templates')
export class TemplatesController {
  @Get()
  list() {
    return BIO_TEMPLATES;
  }
}