"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { useMediaQuery } from "react-responsive"

gsap.registerPlugin(ScrollTrigger)

const highlightPillars = [
  "NLP virality engine",
  "Oracle score bridge",
  "Solana markets",
]

const workflowSteps = [
  {
    title: "Create a Fish",
    tag: "Mint",
    description: "Add a title, category, description, and media to seed a new trend, and mint it as an NFT.",
  },
  {
    title: "Virality score",
    tag: "ML engine",
    description: "The ML engine ingests social data and assigns a bounded virality score to each trend in real time.",
  },
  {
    title: "Bet on Fishes",
    tag: "Trading",
    description: "Bet on fishes by going long or short, depending on whether you think the trend will go viral or flop.",
  },
  {
    title: "Betting curve",
    tag: "Up and down",
    description: "The ML-serivce contstantly updates the virality score based on social signals, which moves the betting curve and your portfolio value up or down.",
  },
  {
    title: "Claim your rewards",
    tag: "Result time",
    description: "If your bet was correct, you can claim your winnings. The sharper your prediction, the higher your reward.",
  },
]

const ModelSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const leftSideRef = useRef<HTMLDivElement | null>(null)
  const rightSideRef = useRef<HTMLDivElement | null>(null)
  const lineRef = useRef<HTMLSpanElement | null>(null)

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" })
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" })

  useGSAP(
    () => {
      if (isMobile || isTablet) return
      if (!sectionRef.current) return

      const revealItems = gsap.utils.toArray<HTMLElement>(
        "[data-model-reveal]",
        sectionRef.current
      )
      const stepCards = gsap.utils.toArray<HTMLElement>(
        ".workflow-card",
        sectionRef.current
      )
      const stepDots = gsap.utils.toArray<HTMLElement>(
        ".workflow-dot",
        sectionRef.current
      )

      gsap.set([leftSideRef.current, rightSideRef.current], {
        opacity: 0,
      })
      gsap.set(leftSideRef.current, { x: -80 })
      gsap.set(rightSideRef.current, { x: 80 })
      gsap.set(revealItems, { y: 30, opacity: 0 })
      gsap.set(stepCards, { y: 40, opacity: 0 })
      gsap.set(stepDots, { scale: 0, opacity: 0 })

      if (lineRef.current) {
        gsap.set(lineRef.current, {
          scaleY: 0,
          transformOrigin: "top",
        })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "bottom 45%",
          scrub: 0.6,
        },
      })

      tl.to(leftSideRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      })
        .to(
          rightSideRef.current,
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          "<0.1"
        )
        .to(
          revealItems,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
          },
          "<0.1"
        )
        .to(
          lineRef.current,
          {
            scaleY: 1,
            duration: 1,
            ease: "power2.out",
          },
          "<0.2"
        )
        .to(
          stepDots,
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(2)",
            stagger: 0.12,
          },
          "<0.1"
        )
        .to(
          stepCards,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.12,
          },
          "<"
        )
    },
    { scope: sectionRef, dependencies: [isMobile, isTablet] }
  )

  return (
    <section
      id="user-journey"
      ref={sectionRef}
      className="relative w-full scroll-mt-[7vh] overflow-hidden bg-black"
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div
          ref={leftSideRef}
          className="relative flex w-full flex-col items-center justify-center gap-6 bg-[#39FF14] px-6 py-16 text-black lg:w-[38%]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5)_0%,_rgba(57,255,20,0)_60%)]" />
          <div className="relative z-10 flex flex-col items-center gap-5 text-center">
            <img src="/assets/logo.svg" alt="logo" className="h-16 w-auto" />
            <p className="text-xs uppercase tracking-[0.4em] text-black/70">TrendiFi core</p>
            <div className="flex flex-col gap-3">
              {highlightPillars.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/20 bg-black/10 px-5 py-2 text-[10px] uppercase tracking-[0.3em]"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Virality", value: "0-100" },
                { label: "Markets", value: "Decentralized" },
                { label: "Engine", value: "NLP" },
                { label: "Chain", value: "Solana" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-black/20 bg-black/10 px-4 py-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-black/60">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-black">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={rightSideRef}
          className="relative flex w-full flex-col gap-12 bg-black px-6 py-14 md:px-10 md:py-20 lg:w-[62%]"
        >
          <div className="absolute -right-40 top-12 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(57,255,20,0.18)_0%,_rgba(0,0,0,0)_70%)]" />
          <div className="relative z-10 space-y-6">
            <p
              data-model-reveal
              className="text-xs uppercase tracking-[0.4em] text-[#39FF14]"
            >
              What is TrendiFi
            </p>
            <h2
              data-model-reveal
              className="font-overlord text-white text-4xl md:text-5xl leading-tight"
            >
              An index market for internet virality.
            </h2>
            <p
              data-model-reveal
              className="text-light-100 text-sm md:text-base font-light max-w-2xl"
            >
              TrendiFi bridges off-chain social momentum and on-chain liquidity. Each
              trend becomes a Fish with a bounded AI virality score, letting traders
              go long or short on culture in real time.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Index market", "Oracle scoring", "Trend shares"].map((pill) => (
                <span
                  key={pill}
                  data-model-reveal
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white"
                >
                  {pill}
                </span>
              ))}
            </div>
            <a
              data-model-reveal
              href="/discover"
              className="inline-flex w-fit rounded-full border border-[#39FF14] bg-[#39FF14] px-6 py-2 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-black shadow-[0_0_25px_rgba(57,255,20,0.2)] transition hover:bg-transparent hover:text-[#39FF14]"
            >
              Get Started - Mint a Fish
            </a>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p
                  data-model-reveal
                  className="text-xs uppercase tracking-[0.4em] text-[#39FF14]"
                >
                  Workflow
                </p>
                <h3
                  data-model-reveal
                  className="text-white text-2xl md:text-3xl font-semibold"
                >
                  From signal to market.
                </h3>
              </div>
              <span
                data-model-reveal
                className="text-[10px] uppercase tracking-[0.3em] text-light-100"
              >
                5-step journey
              </span>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6">
              <span
                ref={lineRef}
                className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-[#39FF14] via-white/30 to-transparent"
              />
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="workflow-card relative pl-10">
                    <span className="workflow-dot absolute left-[22px] top-7 h-3 w-3 rounded-full bg-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.65)]" />
                    <div className="rounded-2xl border border-white/10 bg-black/70 px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-light-100">
                          Step {`0${index + 1}`}
                        </p>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-[#39FF14]">
                          {step.tag}
                        </span>
                      </div>
                      <h4 className="mt-3 text-white text-lg font-semibold">
                        {step.title}
                      </h4>
                      <p className="mt-2 text-light-100 text-xs md:text-sm font-light leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ModelSection