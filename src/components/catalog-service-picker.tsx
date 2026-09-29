"use client";

import type { ReactNode } from "react";

import {
  servicesForMedia,
  type CatalogServiceId,
} from "@/lib/catalog/services";
import type { MediaType } from "@/lib/types";
import { cn } from "@/lib/utils";

type CatalogServicePickerProps = {
  mediaType: MediaType;
  value?: CatalogServiceId;
  onChange: (value?: CatalogServiceId) => void;
};

export function CatalogServicePicker({
  mediaType,
  value,
  onChange,
}: CatalogServicePickerProps) {
  const options = servicesForMedia(mediaType);
  if (!options.length) return null;

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-bold">探す場所</legend>
      <div className="flex flex-wrap gap-1.5">
        <Chip
          selected={!value}
          onClick={() => onChange(undefined)}
        >
          すべて
        </Chip>
        {options.map((service) => (
          <Chip
            key={service.id}
            selected={value === service.id}
            onClick={() => onChange(service.id)}
          >
            {service.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
        selected
          ? "bg-primary text-foreground"
          : "bg-muted/70 text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
