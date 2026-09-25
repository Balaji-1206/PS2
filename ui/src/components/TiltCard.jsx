import React, { useState, useEffect, useRef } from "react";

export default function TiltCard({ 
  children, 
  className = "", 
  style = {}, 
  maxTilt = 5, 
  glowColor = "rgba(249, 115, 22, 0.16)",
  staggerIndex = 0,
  delayMs = null,
  threshold = 0.25,
  onClick 
}) {
  const cardRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tiltTransform, setTiltTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, opacity: 0 });

  // Calculate stagger delay (80–120ms per card, default 100ms)
  const actualDelay = delayMs !== null ? delayMs : staggerIndex * 100;

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Check if reduced motion is requested
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (prefersReducedMotion || actualDelay === 0) {
            setIsRevealed(true);
          } else {
            const timer = setTimeout(() => {
              setIsRevealed(true);
            }, actualDelay);
            return () => clearTimeout(timer);
          }
          // Trigger once
          observer.unobserve(cardEl);
        }
      },
      { threshold: Math.min(Math.max(threshold, 0.1), 0.5) }
    );

    observer.observe(cardEl);

    return () => {
      if (cardEl) observer.unobserve(cardEl);
    };
  }, [actualDelay, threshold]);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !isRevealed) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTiltTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`);
    setSpotlight({ x, y, opacity: 1 });
  };

  const handleMouseEnter = () => {
    if (isRevealed) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)");
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  // Base entrance animation vs revealed + hover state
  let transformStyle = "";
  if (!isRevealed) {
    transformStyle = "translateY(40px) scale(0.95)";
  } else if (isHovered) {
    transformStyle = `${tiltTransform} translateY(-8px) scale(1.02)`;
  } else {
    transformStyle = "translateY(0px) scale(1)";
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`glass-tilt-card card-scroll-reveal ${isRevealed ? "revealed" : ""} ${className}`}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: transformStyle,
        filter: isRevealed ? "blur(0px)" : "blur(8px)",
        transition: isHovered 
          ? "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease" 
          : "opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), filter 0.75s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, border-color 0.28s ease",
        willChange: "transform, opacity, filter",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="card-spotlight-layer"
        style={{
          background: `radial-gradient(circle 320px at ${spotlight.x}px ${spotlight.y}px, ${glowColor}, transparent 75%)`,
          opacity: spotlight.opacity,
          transition: "opacity 0.28s ease",
        }}
      />

      {/* Card Content with 3D Depth */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
