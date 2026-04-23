"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const DIVIDER_D = "M 10,14 C 90,4 190,24 280,12 C 370,2 440,22 530,14 C 620,6 680,20 720,16";

export default function AuraDivider() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    const st = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: path,
        start: "top 85%",
        end: "bottom 60%",
        scrub: 0.6,
      },
    });
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, []);

  return (
    <svg
      className="w-full my-20"
      viewBox="0 0 730 28"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ maxWidth: 560, display: "block", margin: "80px auto", overflow: "visible" }}
    >
      <path
        ref={pathRef}
        d={DIVIDER_D}
        stroke="#FFEFDE"
        strokeOpacity="0.28"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
