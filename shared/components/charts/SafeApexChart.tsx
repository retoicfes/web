"use client";

import type { Props } from "react-apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function SafeApexChart(props: Props) {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    const mountChart = () => {
      if (!cancelled) {
        setReady(true);
      }
    };

    const tryMount = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(mountChart);
        });
        return true;
      }
      return false;
    };

    if (tryMount()) {
      return () => {
        cancelled = true;
        setReady(false);
      };
    }

    const observer = new ResizeObserver(() => {
      if (tryMount()) {
        observer.disconnect();
      }
    });
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      setReady(false);
    };
  }, []);

  const minHeight =
    typeof props.height === "number" ? props.height : undefined;
  const minWidth =
    typeof props.width === "number" ? props.width : undefined;

  const options = {
    ...props.options,
    chart: {
      ...props.options?.chart,
      redrawOnParentResize: true,
    },
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight,
        minWidth,
        width: minWidth ? minWidth : "100%",
      }}
    >
      {ready ? (
        <ApexChart {...props} options={options} />
      ) : null}
    </div>
  );
}
