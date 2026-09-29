"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MEDIA_EMOJI,
  MEDIA_LABEL,
  MEDIA_TYPES,
  type MediaType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const CHIP: Record<MediaType, string> = {
  music: "bg-[#111111] text-primary",
  book: "bg-[#3f4634] text-[#f5f5f0]",
  movie: "bg-primary text-foreground",
};

type MediaTypePickerProps = {
  value: MediaType;
  onChange: (value: MediaType) => void;
  name?: string;
};

export function MediaTypePicker({
  value,
  onChange,
  name = "media-type",
}: MediaTypePickerProps) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-bold">メディアタイプ</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          if (next === "book" || next === "music" || next === "movie") {
            onChange(next);
          }
        }}
        className="grid grid-cols-3 gap-1.5 rounded-lg border border-foreground/10 bg-white p-1.5"
        name={name}
      >
        {MEDIA_TYPES.map((type) => {
          const selected = value === type;
          return (
            <Label
              key={type}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-semibold transition-colors",
                selected
                  ? CHIP[type]
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <RadioGroupItem value={type} className="sr-only" />
              <span aria-hidden="true">{MEDIA_EMOJI[type]}</span>
              {MEDIA_LABEL[type]}
            </Label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
