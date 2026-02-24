"use client";

import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { usePrevNextButtons } from "./carousel-arrow-buttons";
import type { CarouselApi, CarouselOptions, CarouselPlugin } from "./carousel-context";
import { CarouselContext, useCarousel } from "./carousel-context";
import { CarouselDots } from "./carousel-dot-buttons";
import { useOpacityTween } from "./carousel-opacity-tween";

// ─── Types ────────────────────────────────────────────────────────────────────

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  tweenOpacity?: boolean;
  showDots?: boolean;
};

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  tweenOpacity = false,
  showDots = false,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins,
  );

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(api);

  useOpacityTween(api, tweenOpacity);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevButtonClick();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNextButtonClick();
      }
    },
    [onPrevButtonClick, onNextButtonClick],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev: onPrevButtonClick,
        scrollNext: onNextButtonClick,
        canScrollPrev: !prevBtnDisabled,
        canScrollNext: !nextBtnDisabled,
      }}
    >
      <section
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        aria-label="Carousel"
        data-slot="carousel"
        data-tween-opacity={tweenOpacity ? "true" : undefined}
        {...props}
      >
        {children}
        {showDots && <CarouselDots />}
      </section>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div
        className={cn(
          "flex backface-hidden",
          // touch-action mirrors the official Embla demo — browser handles vertical
          // scroll natively while Embla owns the horizontal axis
          orientation === "horizontal" ? "-ml-4 touch-pan-y" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        "[&_video]:touch-pan-y",
        className,
      )}
      {...props}
    />
  );
}

export type { CarouselApi };
export { Carousel, CarouselContent, CarouselItem, useCarousel };
export { CarouselNext, CarouselPrevious } from "./carousel-arrow-buttons";
export { CarouselDots, useDotButton } from "./carousel-dot-buttons";
export { useOpacityTween } from "./carousel-opacity-tween";
