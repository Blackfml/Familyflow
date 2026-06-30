import { useRef, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
}

export default function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 3,
  className = "",
  emptyMessage = "Nenhum item encontrado",
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);

    setContainerHeight(container.clientHeight);

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const totalHeight = items.length * itemHeight;

  const { visibleStart, visibleEnd } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { visibleStart: start, visibleEnd: end };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 text-slate-400 text-sm ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ position: "relative" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${visibleStart * itemHeight}px)`,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
}
