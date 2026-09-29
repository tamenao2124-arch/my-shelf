import { displayTags } from "@/lib/review";

export function TagPills({
  tags,
  limit = 1,
}: {
  tags?: string[];
  limit?: number;
}) {
  const visible = displayTags(tags, limit);
  if (visible.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <li
          key={tag}
          className="rounded-md bg-[#111111] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
