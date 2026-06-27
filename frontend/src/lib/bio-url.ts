// Domínio público dos bio links / cartões
export const BIO_DOMAIN =
  process.env.NEXT_PUBLIC_BIO_DOMAIN || 'bio.gleego.com.br';

// URL completa pública do cartão a partir do slug
export function bioUrl(slug: string) {
  return `https://${BIO_DOMAIN}/${slug}`;
}

// Texto curto para exibir (sem https://)
export function bioDisplay(slug: string) {
  return `${BIO_DOMAIN}/${slug || 'seu-link'}`;
}
