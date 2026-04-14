import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useMediaQuery } from "react-responsive";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });
  const container = useRef(null);

  useGSAP(
    () => {
      if (isMobile || isTablet) {
        gsap.set(".mask img", { scale: 1 });
        gsap.set(".content", { opacity: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top+=8",
          end: "+=250%",
          scrub: 0.5, // Reduced from 1 for smoother feel
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(".mask img", {
          scale: 1,
          duration: 1,
        })
        .to(".mask img", {
          scale: 60,
          transformOrigin: "50% 30%",
          ease: "power1.inOut",
          duration: 3,
        })
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

    },
    { scope: container, dependencies: [isMobile, isTablet] }
  );

  return (
    <section id="showcase" ref={container} className="relative z-10 overflow-hidden bg-black">
      <div className="media">
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

      <div
        id="know-more"
        className="content relative z-50 scroll-mt-[7vh] px-4 md:px-0"
        style={{ opacity: 0, transform: "translateY(50px)" }}
      >
        <div className="wrapper mt-5">
          <div className="lg:max-w-md md:pt-5 pt-3">
            <h2 className="font-regular uppercase text-white text-[32px] md:text-[45px] leading-[40px] md:leading-[50px] tracking-widest">
              bet on what will go viral
            </h2>

            <div className="space-y-4 md:space-y-5 mt-5 md:mt-7 pe-4 md:pe-10 uppercase text-[11px] md:text-[12px] leading-relaxed">
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

            <a
              href="/discover"
              className="inline-flex w-fit items-center justify-center rounded-full border border-[#39FF14] bg-transparent px-6 py-2 my-5 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#39FF14] shadow-[0_0_22px_rgba(57,255,20,0.2)] transition hover:bg-[#39FF14] hover:text-black"
            >
              Get Started - See the curve
            </a>
          </div>

          <div className="max-w-xs md:max-w-3xs space-y-8 md:space-y-14 uppercase pt-5 md:pt-5 px-0 md:px-0">
            <div className="space-y-2 text-[11px] md:text-[12px]">
              <p>Up to</p>
              <h3 className="text-[#39FF14] text-lg md:text-xl">10x returns</h3>
              <p>on early trend predictions</p>
            </div>

            <div className="space-y-2 text-[11px] md:text-[12px]">
              <p>Deployed on</p>
              <h3 className="text-[#39FF14] text-lg md:text-xl">Solana</h3>
              <p>real-time sentiment & on-chain markets</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;