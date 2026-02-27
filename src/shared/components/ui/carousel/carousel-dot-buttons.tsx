"use client";

import type { EmblaCarouselType } from "embla-carousel";
import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { useCarousel } from "./carousel-context";

type UseDotButtonType = {
  selectedIndex: number;
  scrollSnaps: number[];
  onDotButtonClick: (index: number) => void;
};

export function useDotButton(emblaApi: EmblaCarouselType | undefined): UseDotButtonType {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onDotButtonClick = React.useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  const onInit = React.useCallback((api: EmblaCarouselType) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = React.useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return { selectedIndex, scrollSnaps, onDotButtonClick };
}

export function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { api } = useCarousel();
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(api);

  if (scrollSnaps.length <= 1) return null;

  return (
    <div
      className={cn("flex justify-center gap-1.5 pt-3", className)}
      data-slot="carousel-dots"
      {...props}
    >
      {scrollSnaps.map((snapPosition, index) => (
        <button
          key={`dot-${index}-${snapPosition}`}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === selectedIndex}
          onClick={() => onDotButtonClick(index)}
          className={cn(
            "size-2 rounded-full transition-opacity",
            index === selectedIndex
              ? "bg-primary opacity-100"
              : "bg-primary/30 opacity-60 hover:opacity-80",
          )}
        />
      ))}
    </div>
  );
}
