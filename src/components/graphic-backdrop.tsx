export function GraphicBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -top-24 -left-16 size-[28rem] rotate-12 bg-primary/70" />
      <div className="absolute top-1/3 -right-20 h-[22rem] w-[14rem] -rotate-6 bg-[#111111]" />
      <div className="absolute right-[12%] top-16 size-16 bg-primary" />
      <div className="absolute bottom-24 left-[8%] h-2 w-40 bg-[#111111]" />
      <div className="absolute bottom-[18%] right-[22%] size-10 border-2 border-[#111111]" />
    </div>
  );
}
