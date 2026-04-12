import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize ScrollTrigger configuration
export const initializeScrollTrigger = () => {
  // This forces a consistent feel across different trackpads/mice
  ScrollTrigger.normalizeScroll(true);

  // You can also adjust the "config" for sensitivity
  ScrollTrigger.config({ limitCallbacks: true });
};

export default gsap;
