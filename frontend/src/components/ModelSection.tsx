"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

const ModelSection = () => {
  const sectionRef = useRef(null)
  const leftSideRef = useRef(null)
  const rightSideRef = useRef(null)
  const h1Ref = useRef(null)
  const pRef = useRef(null)
  const buttonRef = useRef(null)

  useGSAP(() => {
    // Timeline for the entire section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        markers: false,
      },
    })

    // Left side slides in from left with opacity
    tl.fromTo(
      leftSideRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, ease: "power2.out" }
    )

    // Right side slides in from right with opacity
    tl.fromTo(
      rightSideRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, ease: "power2.out" },
      "<"
    )

    // H1 scales and fades
    tl.to(
      h1Ref.current,
      { scale: 1, opacity: 1, ease: "power2.out" },
      "<"
    )

    // Paragraph parallax effect with stagger
    tl.to(
      pRef.current,
      { y: -30, opacity: 1, ease: "none" },
      "<"
    )

    // Button fade in and slight slide
    tl.to(
      buttonRef.current,
      { y: 0, opacity: 1, ease: "power2.out" },
      "<0.1"
    )
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="!min-h-screen !w-full !bg-black !overflow-hidden !flex !items-stretch !justify-start gap-0">
        <div ref={leftSideRef} className="bg-[#39FF14] flex-[0_0_40%] h-screen flex items-center justify-center opacity-0">
          <img src="/assets/logo.svg" alt="logo" className="h-[20vh] w-auto"/>
        </div>
        <div ref={rightSideRef} className="flex-[0_0_60%] flex flex-col items-start px-10 py-20 justify-center opacity-0 bg-black">
            <h1 ref={h1Ref} className="font-overlord text-[#39FF14] text-[45px] text-left scale-95 opacity-0">What is Trendifi</h1>
            <p ref={pRef} className="font-regular text-xs uppercase text-white tracking-widest mt-5 leading-6 opacity-0">
                TRENDIFI IS A DECENTRALIZED PLATFORM WHERE IDEAS, OPINIONS, AND MEMES ARE TRANSFORMED INTO TRADABLE DIGITAL ASSETS, ENABLING USERS TO SPECULATE ON THEIR FUTURE VIRALITY. BY COMBINING SOCIAL SENTIMENT ANALYSIS WITH MARKET DYNAMICS, IT CREATES A PREDICTION-DRIVEN ECOSYSTEM WHERE USERS CAN INVEST IN TRENDS EARLY, REWARDING ACCURATE FORESIGHT WHILE FOSTERING A NEW FORM OF COMMUNITY-DRIVEN CONTENT DISCOVERY AND ENGAGEMENT.
            </p>
            <button ref={buttonRef} className="bg-[#39FF14] text-black font-overlord text-sm uppercase tracking-widest py-3 px-6 border-2 border-[#39FF14] hover:bg-transparent hover:text-[#39FF14] transition-all duration-300 mt-5 opacity-0 translate-y-4">Get Started</button>
        </div>
    </section>
  )
}

export default ModelSection