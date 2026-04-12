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
    // Disable animations on mobile for performance
    if (isMobile) return

    // Parallax effect for left paragraph
    gsap.to(pLeftRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        markers: false,
      },
      opacity: 0.5,
      ease: "none",
    })

    // Parallax effect for right paragraph
    gsap.to(pRightRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        markers: false,
      },
      opacity: 0.5,
      ease: "none",
    })

    // Parallax effect for h1
    gsap.to(h1Ref.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        markers: false,
      },
      scale: 0.9,
      opacity: 0.8,
      ease: "none",
    })
  }, { dependencies: [isMobile] })

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