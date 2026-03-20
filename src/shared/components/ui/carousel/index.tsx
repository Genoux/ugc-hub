"use client";

import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";
import { cn } from "@/shared/lib/utils";
import {
  CarouselNext,
  CarouselPrevious,
  usePrevNextButtons,
} from "./carousel-arrow-buttons";
import type {
  CarouselApi,
  CarouselButtonPlacement,
  CarouselOptions,
  CarouselPlugin,
} from "./carousel-context";
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
  /** "aside" = prev/next left and right of carousel (default). "bottom-right" = both buttons bottom-right. */
  buttonPlacement?: CarouselButtonPlacement;
  /** Scroll duration (Embla uses physics, not easing). Higher = slower/smoother. Recommended 20–60. Default 25. */
  scrollDuration?: number;
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
  buttonPlacement = "aside",
  scrollDuration,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
      ...(scrollDuration !== undefined && { duration: scrollDuration }),
    },
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

  const useBottomRow = buttonPlacement === "bottom-right";
  const { content, arrowButtons, rest } = React.useMemo(() => {
    let content: React.ReactNode = null;
    const arrowButtons: React.ReactNode[] = [];
    const rest: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === CarouselContent) content = child;
      else if (child.type === CarouselPrevious || child.type === CarouselNext)
        arrowButtons.push(child);
      else rest.push(child);
    });
    return { content, arrowButtons, rest };
  }, [children]);

  const resolved =
    useBottomRow && arrowButtons.length > 0 && content != null
      ? [
        content,
        ...rest,
        <div key="carousel-buttons" className="flex justify-end gap-2 mt-2">
          {arrowButtons}
        </div>,
      ]
      : children;

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        buttonPlacement,
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
        {resolved}
        {showDots && <CarouselDots />}
      </section>
    </CarouselContext.Provider>
  );
}

type CarouselContentProps = React.ComponentProps<"div"> & {
  /** Sets a fixed height on the viewport so items can use h-full (e.g. for fixed-ratio slides). */
  viewportClassName?: string;
};

function CarouselContent({ className, viewportClassName, ...props }: CarouselContentProps) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className={cn("overflow-x-auto", viewportClassName)}
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex h-full backface-hidden touch-pan-y",
          orientation === "horizontal" ? "gap-2" : "flex-col gap-2",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/** Default basis-full = one slide visible. Override with e.g. basis-1/4 for 4 visible; Embla needs fixed widths to compute scroll/snaps. */
function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  useCarousel();

  return (
    <div
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full [&_video]:touch-pan-y",
        className,
      )}
      {...props}
    />
  );
}

export type { CarouselApi, CarouselButtonPlacement };
export { Carousel, CarouselContent, CarouselItem, useCarousel };
export { CarouselNext, CarouselPrevious } from "./carousel-arrow-buttons";
export { CarouselDots, useDotButton } from "./carousel-dot-buttons";
export { useOpacityTween } from "./carousel-opacity-tween";
