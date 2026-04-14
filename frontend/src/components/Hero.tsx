"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"
import { useMediaQuery } from "react-responsive"

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
  const sectionRef = useRef(null)
  const pLeftRef = useRef(null)
  const pRightRef = useRef(null)
  const h1Ref = useRef(null)
  
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" })
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" })

  useGSAP(() => {
    // Disable animations on mobile and tablet for better performance
    if (isMobile || isTablet) return

    // Single timeline for smoother performance
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 0.5, // Reduced from 1 for smoother feel
        markers: false,
      },
    })

    // Parallax effects bundled in one timeline
    tl.to([pLeftRef.current, pRightRef.current], { opacity: 0.5, ease: "none" }, 0)
      .to(h1Ref.current, { scale: 0.9, opacity: 0.8, ease: "none" }, 0)
  }, { dependencies: [isMobile, isTablet] })

  return (
    <section ref={sectionRef} className="min-h-screen w-full flex flex-col items-center justify-center pt-16 md:pt-20 px-4 md:px-0">
      <div className="w-full flex flex-col md:flex-row justify-between items-start gap-4 md:gap-10 mt-6 md:mt-10 px-0 md:px-10">
        <p ref={pLeftRef} className="flex-1 text-white font-light tracking-widest text-xs md:text-sm text-left inline align-top">
          SEE WHATS TRENDING
        </p>
        <p ref={pRightRef} className="flex-1 text-white font-light tracking-widest text-xs md:text-sm text-left md:text-right inline align-top">
          PREDICT WHAT'S TRENDING
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <h1 ref={h1Ref} className="font-overlord text-[80px] sm:text-[120px] md:text-[12vw] lg:text-[55vw] text-[#39FF14] leading-none text-center">
          TRENDIFI
        </h1>
      </div>
    </section>
  )
}

export default Hero