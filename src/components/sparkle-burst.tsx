"use client";

const MARKS = ["★", "✦", "■", "◆", "★", "✦"];

const OFFSETS = [
  { x: "-18px", y: "-34px" },
  { x: "16px", y: "-38px" },
  { x: "-8px", y: "-48px" },
  { x: "22px", y: "-24px" },
  { x: "-24px", y: "-22px" },
  { x: "4px", y: "-52px" },
];

export function SparkleBurst({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <span className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {MARKS.map((mark, index) => (
        <span
          key={`${mark}-${index}`}
          className="animate-pop-float absolute top-1/2 left-1/2 text-xs font-black text-foreground"
          style={{
            ["--burst-x" as string]: OFFSETS[index].x,
            ["--burst-y" as string]: OFFSETS[index].y,
            animationDelay: `${index * 40}ms`,
          }}
        >
          {mark}
        </span>
      ))}
    </span>
  );
}
