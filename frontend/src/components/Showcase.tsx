import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useMediaQuery } from "react-responsive";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });
  const container = useRef(null);

  useGSAP(
    () => {
      if (!isTablet) {
        // REMOVED: gsap.set(".mask img", { y: 400 });
        // Let the mask sit naturally at y: 0 so the text is fully visible.

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "+=250%",
            scrub: 1,
            pin: true,
          },
        });

        timeline
          // 1. THE PAUSE: Let the user read the mask text and watch the video
          .to(".mask img", {
            scale: 1,
            duration: 1,
          })
          // 2. THE ZOOM
          .to(".mask img", {
            scale: 60,
            // CRITICAL CHANGE: Instead of "center center", we set the focal point 
            // to the X-center (50%) and roughly the Y-position of the logo hole (30%).
            // This ensures the camera flies through the logo, not the black space.
            transformOrigin: "50% 30%", 
            ease: "power1.inOut",
            duration: 3,
          })
          // 3. THE REVEAL: Fade in the content
          .to(
            ".content",
            {
              opacity: 1,
              y: 0,
              ease: "power1.in",
              duration: 1,
            },
            "<80%"
          );
      }
    },
    { scope: container, dependencies: [isTablet] }
  );

  return (
    <section id="showcase" ref={container}>
      <div className="media">
        {/* VIDEO FRAMING FIX: 
            If the video's subject isn't lining up with the mask holes, 
            adjust the 'object-position' here to slide the video up or down inside its container 
            while keeping the mask perfectly centered. */}
        <video 
          src="/assets/videos/video.mp4" 
          className="w-full h-full object-cover object-[center_top]"
          loop 
          autoPlay 
          muted 
          playsInline
        ></video>
      </div>

      <div className="mask">
        <img 
          src="/assets/mask.svg" 
          alt="mask" 
          className="w-full h-full object-cover object-[center_80%]"
        />
      </div>

      <div className="content relative z-50" style={{ opacity: 0, transform: "translateY(50px)" }}>
        {/* ... ALL YOUR CONTENT ... */}
        <div className="wrapper mt-5">
          <div className="lg:max-w-md pt-5">
            <h2 className="font-regular uppercase text-white text-[45px] leading-[50px] tracking-widest">
              bet on what will go viral
            </h2>

            <div className="space-y-5 mt-7 pe-10 uppercase text-[12px]">
              <p>
                Turn ideas into <span className="text-white">tradable assets</span>.
                Predict which memes, opinions, or trends will explode before the internet does.
              </p>

              <p>
                Our AI tracks social signals across platforms, measuring mentions,
                engagement, and momentum to calculate a real-time virality score.
              </p>

              <p>
                Buy early, sell at peak — just like markets, but for attention.
                The sharper your prediction, the higher your reward.
              </p>

              <p className="text-[#39FF14]">
                Learn how we calculate virality scores
              </p>
            </div>
          </div>

          <div className="max-w-3xs space-y-14 uppercase pt-5">
            <div className="space-y-2 text-[12px]">
              <p>Up to</p>
              <h3 className="text-[#39FF14] text-xl">10x returns</h3>
              <p>on early trend predictions</p>
            </div>

            <div className="space-y-2 text-[12px]">
              <p>Deployed on</p>
              <h3 className="text-[#39FF14] text-xl">Solana</h3>
              <p>real-time sentiment & on-chain markets</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;