import { type RefObject, useEffect, useRef } from "react";

export function useInfiniteScroll({
  scrollRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!scrollEl || !sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { root: scrollEl, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, scrollRef]);

  return sentinelRef;
}
