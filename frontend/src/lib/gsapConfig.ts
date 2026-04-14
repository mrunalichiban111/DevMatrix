import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize ScrollTrigger configuration
export const initializeScrollTrigger = () => {
  // Disable normalizeScroll to prevent glitchy behavior
  ScrollTrigger.normalizeScroll(false);

  // Optimize ScrollTrigger performance
  ScrollTrigger.config({ 
    limitCallbacks: true,
    autoRefreshEvents: "visibilitychange,domContentLoaded,load",
  });

  // Reduce CPU usage
  gsap.config({ autoSleep: 60 });
};

export default gsap;
