import Image from 'next/image';
import Link from 'next/link';

export function Logo({ size = 36, withText = true, href = '/' }: { size?: number; withText?: boolean; href?: string | null }) {
  const content = (
    <span className="inline-flex items-center gap-2 select-none">
      <Image
        src="/brand/logo.png"
        alt="Glee-go ID"
        width={size * 4}
        height={size}
        priority
        style={{ height: size, width: 'auto' }}
        className="drop-shadow-[0_0_18px_rgba(34,211,106,0.35)]"
      />
    </span>
  );
  if (!href) return content;
  return <Link href={href} aria-label="Glee-go ID">{content}</Link>;
}