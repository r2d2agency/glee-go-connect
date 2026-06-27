import { Controller, Get } from '@nestjs/common';

export const BIO_TEMPLATES = [
  { id: 'minimal', name: 'Minimal', description: 'Limpo, claro, focado em legibilidade.', primaryColor: '#1E40AF', dark: false },
  { id: 'dark', name: 'Dark', description: 'Fundo escuro com destaques vibrantes.', primaryColor: '#10B981', dark: true },
  { id: 'vibrant', name: 'Vibrant', description: 'Gradiente colorido, energia jovem.', primaryColor: '#EC4899', dark: false },
  { id: 'pro', name: 'Pro', description: 'Sóbrio e profissional para negócios.', primaryColor: '#0F172A', dark: true },
];

@Controller('templates')
export class TemplatesController {
  @Get()
  list() {
    return BIO_TEMPLATES;
  }
}