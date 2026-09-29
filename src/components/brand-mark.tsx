export function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/artly-mark.svg"
      alt="Artly"
      className={className}
      width={36}
      height={36}
    />
  );
}
