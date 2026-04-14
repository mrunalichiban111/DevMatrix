"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useMediaQuery } from "react-responsive";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const StatisticsSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const graphRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const barRefs = useRef<HTMLDivElement[]>([]);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  useGSAP(
    () => {
      if (isMobile || isTablet) return;
      if (!sectionRef.current) return;

      const path = pathRef.current;
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      }

      gsap.set(barRefs.current, { height: 0, opacity: 0.5 });
      gsap.set(graphRef.current, { y: 30, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "bottom 45%",
          scrub: 0.6,
        },
      });

      tl.to(
        barRefs.current,
        {
          height: (index, element) => `${element.dataset.value}%`,
          opacity: 1,
          ease: "power2.out",
          stagger: 0.12,
        },
        0
      )
        .to(
          path,
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.out",
          },
          0.2
        )
        .to(
          graphRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          0.1
        );
    },
    { dependencies: [isMobile, isTablet] }
  );

  const registerBar = (index: number) => (element: HTMLDivElement | null) => {
    if (!element) return;
    barRefs.current[index] = element;
  };

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="relative z-0 w-full min-h-screen scroll-mt-[7vh] overflow-hidden bg-black py-16 md:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(57,255,20,0.18)_0%,_rgba(0,0,0,0)_55%)]" />
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(255,148,0,0.25)_0%,_rgba(0,0,0,0)_65%)]" />
      <div className="absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(8,148,255,0.25)_0%,_rgba(0,0,0,0)_70%)]" />

      <div className="container relative z-10 mx-auto px-5 2xl:px-0">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-[#39FF14]">Statistics</p>
            <h2 className="font-overlord text-white text-4xl md:text-5xl leading-tight">
              The signal never sleeps.
            </h2>
            <p className="text-light-100 text-sm md:text-base font-light max-w-xl">
              Our trend engine tracks millions of signals per hour. The graph reflects the
              momentum curve that powers the market feed.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Signal accuracy", value: "92.4%" },
                { label: "Avg breakout", value: "3.1h" },
                { label: "Momentum uplift", value: "+4.8x" },
                { label: "Active markets", value: "312" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-light-100">{item.label}</p>
                  <p className="mt-3 text-white text-xl md:text-2xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <a
              href="/discover"
              className="inline-flex w-fit items-center justify-center rounded-full border border-[#39FF14] bg-[#39FF14] px-6 py-2 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-black shadow-[0_0_25px_rgba(57,255,20,0.2)] transition hover:bg-transparent hover:text-[#39FF14]"
            >
              Get Started - Track signals
            </a>
          </div>

          <div ref={graphRef} className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-light-100">Virality index</p>
                  <h3 className="text-white text-xl font-semibold">Live momentum curve</h3>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-[#39FF14]">Realtime</span>
              </div>

              <div className="relative mt-8 h-44 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4">
                <div className="absolute inset-4 rounded-2xl border border-white/5" />
                <div className="relative z-10 flex h-full items-end gap-3">
                  {[62, 44, 78, 58, 92, 66, 84].map((value, index) => (
                    <div
                      key={`${value}-${index}`}
                      ref={registerBar(index)}
                      data-value={value}
                      className="flex-1 rounded-full bg-gradient-to-t from-[#39FF14] via-[#8fff79] to-white/80"
                      style={{ height: 0 }}
                    />
                  ))}
                </div>

                <svg
                  className="absolute left-4 right-4 top-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
                  viewBox="0 0 300 120"
                  preserveAspectRatio="none"
                >
                  <path
                    ref={pathRef}
                    d="M0 110 L40 92 L80 96 L120 70 L160 80 L200 40 L240 58 L300 30"
                    fill="none"
                    stroke="#39FF14"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Top 1%", subtitle: "Trend accuracy" },
                { title: "2026", subtitle: "Web3 insight award" },
                { title: "Solana", subtitle: "Ecosystem finalist" },
              ].map((award) => (
                <div
                  key={award.subtitle}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center"
                >
                  <p className="text-[#39FF14] text-lg font-semibold uppercase tracking-[0.2em]">
                    {award.title}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-light-100">
                    {award.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
