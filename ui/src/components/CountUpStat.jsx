import React, { useState, useEffect, useRef } from "react";

export default function CountUpStat({ 
  endValue, 
  prefix = "", 
  suffix = "", 
  duration = 1800, 
  decimals = 0 
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    let startTimestamp = null;
    const target = parseFloat(endValue);
    if (isNaN(target)) {
      setDisplayValue(endValue);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = easeOutProgress * target;

            setDisplayValue(decimals > 0 ? current.toFixed(decimals) : Math.floor(current));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setDisplayValue(target);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [endValue, duration, decimals]);

  return (
    <span ref={elementRef}>
      {prefix}
      {typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}
      {suffix}
    </span>
  );
}
