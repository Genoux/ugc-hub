import type { EmblaCarouselType } from "embla-carousel";
import * as React from "react";

const TWEEN_FACTOR_BASE = 0.5;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

export function useOpacityTween(api: EmblaCarouselType | undefined, enabled: boolean): void {
  const tweenFactorRef = React.useRef(0);

  const setTweenFactor = React.useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactorRef.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenOpacity = React.useCallback((emblaApi: EmblaCarouselType, evt?: string) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = evt === "scroll";

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
            }
          });
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactorRef.current);
        const opacity = numberWithinRange(tweenValue, 0, 1);
        const node = emblaApi.slideNodes()[slideIndex];
        node.style.opacity = opacity.toString();
        node.style.pointerEvents = opacity <= 0.8 ? "none" : "auto";
      });
    });
  }, []);

  React.useEffect(() => {
    if (!api || !enabled) return;

    setTweenFactor(api);
    tweenOpacity(api);
    api
      .on("reInit", setTweenFactor)
      .on("reInit", tweenOpacity)
      .on("scroll", tweenOpacity)
      .on("slideFocus", tweenOpacity);

    return () => {
      api
        .off("reInit", setTweenFactor)
        .off("reInit", tweenOpacity)
        .off("scroll", tweenOpacity)
        .off("slideFocus", tweenOpacity);
      api.slideNodes().forEach((node) => {
        node.style.opacity = "";
        node.style.pointerEvents = "";
      });
    };
  }, [api, enabled, setTweenFactor, tweenOpacity]);
}
