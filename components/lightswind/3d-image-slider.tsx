"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useInView } from "framer-motion";

const DEFAULT_DATA = [
  "https://images.unsplash.com/photo-1540968221243-29f5d70540bf?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1596135187959-562c650d98bc?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1628944682084-831f35256163?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1590013330451-3946e83e0392?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1590421959604-741d0eec0a2e?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1572613000712-eadc57acbecd?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1570097192570-4b49a6736f9f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1620789550663-2b10e0080354?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1617775623669-20bff4ffaa5c?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1548600916-dc8492f8e845?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1573824969595-a76d4365a2e6?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1633936929709-59991b5fdd72?w=800&auto=format&fit=crop&q=60",
];

export type SliderImage = string | { src: string; alt?: string; label?: string };

interface Slider3DProps {
  /** Array of images — plain URLs or objects with src/alt/label. */
  images?: SliderImage[];
  /** Duration of one full 360-degree rotation (in seconds) */
  duration?: number;
  /** Width of each card. Can be px, rem, em, etc. */
  cardWidth?: string;
  /** CSS aspect ratio of the cards */
  cardAspectRatio?: string;
  /** CSS perspective value for the 3D container */
  perspective?: string;
  /** Additional classes for the outermost container */
  containerClassName?: string;
  /** Additional classes for the individual image elements */
  imageClassName?: string;
  /** Direction of the rotation */
  rotationDirection?: "left" | "right";
  /** Whether to apply a gradient fade mask on the edges */
  withMask?: boolean;
}

export default function ImageSlider3D({
  images = DEFAULT_DATA,
  duration = 32,
  cardWidth = "17.5em",
  cardAspectRatio = "7/10",
  perspective = "35em",
  containerClassName = "",
  imageClassName = "",
  rotationDirection = "left",
  withMask = true,
}: Slider3DProps) {
  const n = images.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "200px" });
  const prefersReducedMotion = useReducedMotion();
  const animationDuration = prefersReducedMotion ? duration * 4 : duration;

  // rotation angles based on direction
  const rotationValues = rotationDirection === "left" ? [0, 360] : [360, 0];

  const maskStyles = withMask
    ? {
        WebkitMask:
          "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
        mask: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
      }
    : {};

  return (
    <div
      ref={containerRef}
      className={`grid w-full overflow-hidden place-items-center ${containerClassName}`}
      style={{
        perspective: perspective,
        ...maskStyles,
      }}
    >
      <motion.div
        className="grid place-self-center pointer-events-auto will-change-transform"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={isInView ? { rotateY: rotationValues } : false}
        transition={{
          duration: animationDuration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {images.map((item, i) => {
          const src = typeof item === "string" ? item : item.src;
          const alt =
            typeof item === "string"
              ? `Slide ${i}`
              : (item.alt ?? `TDC moment ${i + 1}`);
          const label = typeof item === "string" ? null : item.label;

          return (
            <div
              key={i}
              className="relative col-start-1 row-start-1"
              style={{
                width: cardWidth,
                aspectRatio: cardAspectRatio,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: `rotateY(calc(${i} * (1turn / ${n}))) translateZ(calc(-1 * (0.5 * ${cardWidth} + 0.5em) / tan(0.5 * (1turn / ${n}))))`,
              }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 640px) 40vw, 20vw"
                className={`object-cover rounded-[1.5em] ${imageClassName}`}
              />
              {label ? (
                <span className="tdc-mono pointer-events-none absolute left-2 top-2 z-10 rounded-[3px] border border-white/25 bg-black/60 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                  {label}
                </span>
              ) : null}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}