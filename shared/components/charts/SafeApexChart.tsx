"use client";

import type { Props } from "react-apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function SafeApexChart(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    const minHeight =
      typeof props.height === "number" ? props.height : undefined;
    return (
      <div aria-hidden style={minHeight ? { minHeight } : undefined} />
    );
  }

  return <ApexChart {...props} />;
}
