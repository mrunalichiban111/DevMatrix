"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
  const sectionRef = useRef(null)
  const pLeftRef = useRef(null)
  const pRightRef = useRef(null)
  const h1Ref = useRef(null)

  useGSAP(() => {
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
  })

  return (
    <section ref={sectionRef} className="min-h-screen w-full flex flex-col items-center justify-center pt-20">
      <div className="w-full flex justify-between items-start px-10 gap-10 mt-10">
        <p ref={pLeftRef} className="flex-1 text-white font-light tracking-widest text-sm whitespace-nowrap text-left inline align-top">
          SEE WHATS TRENDING
        </p>
        <p ref={pRightRef} className="flex-1 text-white font-light tracking-widest text-sm whitespace-nowrap text-right inline align-top">
          PREDICT WHAT'S TRENDING
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <h1 ref={h1Ref} className="font-overlord text-[640px] text-[#39FF14] leading-none">
          TRENDIFI
        </h1>
      </div>
    </section>
  )
}

export default Hero