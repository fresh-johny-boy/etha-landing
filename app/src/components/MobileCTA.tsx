"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MobileCTA(): React.ReactElement {
  const barRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after scrolling past the hero
    const showTrigger = ScrollTrigger.create({
      start: 400,
      onUpdate: (self) => setVisible(self.progress > 0),
    });

    // Flip colors when overlapping dark (aubergine) sections
    const darkSections = document.querySelectorAll(
      "[class*='bg-aubergine']"
    );

    const darkTriggers: ScrollTrigger[] = [];

    darkSections.forEach((section) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom-=80", // when dark section reaches the CTA bar position
        end: "bottom bottom-=80",
        onEnter: () => toCream(),
        onLeave: () => toAubergine(),
        onEnterBack: () => toCream(),
        onLeaveBack: () => toAubergine(),
      });
      darkTriggers.push(trigger);
    });

    function toCream() {
      if (pathRef.current) {
        gsap.to(pathRef.current, {
          attr: { stroke: "#FFEFDE" },
          duration: 0.3,
          overwrite: true,
        });
      }
      if (textRef.current) {
        gsap.to(textRef.current, {
          color: "#FFEFDE",
          duration: 0.3,
          overwrite: true,
        });
      }
    }

    function toAubergine() {
      if (pathRef.current) {
        gsap.to(pathRef.current, {
          attr: { stroke: "#3D233B" },
          duration: 0.3,
          overwrite: true,
        });
      }
      if (textRef.current) {
        gsap.to(textRef.current, {
          color: "#3D233B",
          duration: 0.3,
          overwrite: true,
        });
      }
    }

    return () => {
      showTrigger.kill();
      darkTriggers.forEach((t) => t.kill());
    };
  }, []);

  // Slide in/out
  useEffect(() => {
    if (!barRef.current) return;
    gsap.to(barRef.current, {
      y: visible ? 0 : 80,
      opacity: visible ? 1 : 0,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [visible]);

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 z-50 translate-y-20 opacity-0 md:hidden"
    >
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
        <a
          href="#quiz"
          className="relative flex w-full items-center justify-center py-4"
        >
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 380 56"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              ref={pathRef}
              d="M150,3 C200,1 290,4 340,14 C362,20 375,28 372,38 C367,48 340,52 280,54 C230,56 170,56 130,54 C80,52 40,48 18,40 C4,34 2,26 8,18 C16,8 70,3 150,3"
              stroke="#3D233B"
              strokeWidth="0.75"
              strokeOpacity="0.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span
            ref={textRef}
            className="font-label relative z-10 text-[11px] text-aubergine"
          >
            BEGIN SELF-DISCOVERY
          </span>
        </a>
      </div>
    </div>
  );
}
