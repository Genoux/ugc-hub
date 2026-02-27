"use client";

import type { EmblaCarouselType } from "embla-carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useCarousel } from "./carousel-context";

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export function usePrevNextButtons(
  emblaApi: EmblaCarouselType | undefined,
): UsePrevNextButtonsType {
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);

  const onPrevButtonClick = React.useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = React.useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = React.useCallback((api: EmblaCarouselType) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick };
}

export function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, buttonPlacement, scrollPrev, canScrollPrev } = useCarousel();

  const positionClasses =
    buttonPlacement === "bottom-right"
      ? ""
      : orientation === "horizontal"
        ? "absolute top-1/2 -left-12 -translate-y-1/2"
        : "absolute -top-12 left-1/2 -translate-x-1/2 rotate-90";

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn("rounded-full touch-manipulation", positionClasses, className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

export function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, buttonPlacement, scrollNext, canScrollNext } = useCarousel();

  const positionClasses =
    buttonPlacement === "bottom-right"
      ? ""
      : orientation === "horizontal"
        ? "absolute top-1/2 -right-12 -translate-y-1/2"
        : "absolute -bottom-12 left-1/2 -translate-x-1/2 rotate-90";

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn("rounded-full touch-manipulation", positionClasses, className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}
