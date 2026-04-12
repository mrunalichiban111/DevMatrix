"use client";

import { useEffect } from "react";
import { initializeScrollTrigger } from "@/lib/gsapConfig";

export const GSAPInitializer = () => {
  useEffect(() => {
    // Initialize ScrollTrigger after component mounts
    initializeScrollTrigger();
  }, []);

  return null;
};
