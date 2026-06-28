import { Controller, Get } from '@nestjs/common';

export const BIO_TEMPLATES = [
  { id: 'midnight', name: 'Midnight Neon', description: 'Azul elétrico com brilho neon — estilo Glee-go.', primaryColor: '#3B82F6', accentColor: '#60A5FA', bgColor: '#070B1A', dark: true },
  { id: 'minimal', name: 'Minimal Light', description: 'Branco limpo com azul vibrante.', primaryColor: '#2563EB', accentColor: '#22D36A', bgColor: '#FFFFFF', dark: false },
  { id: 'noir', name: 'Noir Gold', description: 'Preto absoluto com ouro brilhante.', primaryColor: '#F5C453', accentColor: '#FFE08A', bgColor: '#08070A', dark: true },
  { id: 'sunset', name: 'Sunset Glow', description: 'Coral e magenta vibrante neon.', primaryColor: '#FF5577', accentColor: '#FF8A3D', bgColor: '#1A0817', dark: true },
  { id: 'forest', name: 'Forest Neon', description: 'Verde neon vibrante sobre escuro.', primaryColor: '#22FF88', accentColor: '#00E0A8', bgColor: '#06150F', dark: true },
  { id: 'cloud', name: 'Cloud Light', description: 'Azul SaaS suave e arejado.', primaryColor: '#3B82F6', accentColor: '#0EA5E9', bgColor: '#F8FAFC', dark: false },
  // Templates por segmento — todos com cores vibrantes
  { id: 'tech', name: 'Tecnologia', description: 'Dark futurista verde neon e ciano — devs e SaaS.', primaryColor: '#22FF88', accentColor: '#00F0FF', bgColor: '#040A0D', dark: true, industry: 'tecnologia' },
  { id: 'law', name: 'Advocacia', description: 'Navy profundo com dourado luminoso.', primaryColor: '#F5C453', accentColor: '#5B8FD9', bgColor: '#0A1426', dark: true, industry: 'advocacia' },
  { id: 'mentor', name: 'Mentoria', description: 'Roxo neon e dourado — alta performance.', primaryColor: '#A78BFA', accentColor: '#FFD66E', bgColor: '#100624', dark: true, industry: 'mentoria' },
  { id: 'agency', name: 'Agência de Marketing', description: 'Magenta e laranja neon — pura energia.', primaryColor: '#FF3D9A', accentColor: '#FF8A3D', bgColor: '#0E0618', dark: true, industry: 'marketing' },
  { id: 'consulting', name: 'Consultoria', description: 'Azul vibrante com verde — clareza estratégica.', primaryColor: '#3B82F6', accentColor: '#22D36A', bgColor: '#08111C', dark: true, industry: 'consultoria' },
  { id: 'aesthetics', name: 'Estética', description: 'Rosé gold neon e nude — feminino e sofisticado.', primaryColor: '#FF8FB1', accentColor: '#F5C453', bgColor: '#1A0A12', dark: true, industry: 'estetica' },
  { id: 'dental', name: 'Odontologia', description: 'Ciano brilhante — limpeza e cuidado.', primaryColor: '#22D3EE', accentColor: '#38BDF8', bgColor: '#04141A', dark: true, industry: 'odontologia' },
];

@Controller('templates')
export class TemplatesController {
  @Get()
  list() {
    return BIO_TEMPLATES;
  }
}