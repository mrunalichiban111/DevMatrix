'use client';


import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useMediaQuery } from 'react-responsive';

gsap.registerPlugin(useGSAP);

type TrendCard = {
  publicKey: string;
  nftMint: string;
  name: string;
  image: string;
  description: string;
  totalUpBets: number;
  totalDownBets: number;
  upBettors: number;
  downBettors: number;
  endTs: number;
  finalized: boolean;
  result: number;
};

interface TrendsCarouselProps {
  trends: TrendCard[];
  onBet: (trend: TrendCard, side: 0 | 1) => void;
  loading: boolean;
}

export default function TrendsCarousel({ trends, onBet, loading }: TrendsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' });

  const currentTrend = trends[currentIndex];

  // GSAP animations for carousel transitions
  useGSAP(() => {
    if (!currentTrend || isAnimating) return;

    const tl = gsap.timeline();

    // Fade out and slide content
    tl.to(
      contentRef.current,
      {
        opacity: 0,
        x: 20,
        duration: 0.3,
      },
      0
    )
      // Scale and fade image
      .to(
        imageRef.current,
        {
          scale: 0.95,
          opacity: 0.7,
          duration: 0.3,
        },
        0
      )
      // Fade in and slide new content
      .to(contentRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
      })
      // Scale and fade new image
      .to(
        imageRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
        },
        '<'
      );
  }, { dependencies: [currentIndex] });

  const navigate = (direction: 'next' | 'prev') => {
    if (isAnimating || trends.length === 0) return;

    setIsAnimating(true);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prev) => (prev + 1) % trends.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + trends.length) % trends.length);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleBet = (side: 0 | 1) => {
    if (currentTrend) {
      onBet(currentTrend, side);
    }
  };

  if (loading) {
    return (
      <section className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#39FF14]"></div>
          <p className="text-white mt-4 font-light tracking-wider">Loading trends...</p>
        </div>
      </section>
    );
  }

  if (trends.length === 0) {
    return (
      <section className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-light tracking-wider">No trends available</p>
        </div>
      </section>
    );
  }

  const timeLeft = currentTrend.endTs - Math.floor(Date.now() / 1000);
  const isExpired = timeLeft <= 0;
  const totalBets = currentTrend.totalUpBets + currentTrend.totalDownBets;
  const upPct = totalBets > 0 ? Math.round((currentTrend.totalUpBets / totalBets) * 100) : 50;

  return (
    <section className="w-full min-h-screen bg-black text-white flex items-center justify-center relative py-20 md:py-0">
      {/* Navigation Arrows - Left */}
      <button
        onClick={() => navigate('prev')}
        disabled={isAnimating}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-30"
        aria-label="Previous trend"
      >
        <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-[#39FF14] rounded-full flex items-center justify-center hover:bg-[#39FF14]/10 transition-all duration-300 disabled:opacity-30 cursor-pointer hover:scale-110"
        style={{ opacity: isAnimating ? 0.3 : 1 }}>
          <svg className="w-6 h-6 md:w-8 md:h-8 text-[#39FF14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      {/* Main Carousel Container with Octagonal Border */}
      <div 
        ref={carouselRef} 
        className="w-11/12 md:w-5/6 h-auto md:h-[90vh] max-w-4xl relative flex flex-col items-center justify-start md:justify-center gap-0 px-6 md:px-10 py-16 md:py-12 overflow-y-auto"
        style={{
          clipPath: 'polygon(2% 0%, 98% 0%, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0% 98%, 0% 2%)',
          border: '2px solid #39FF14',
          boxShadow: '0 0 30px rgba(57, 255, 20, 0.3), inset 0 0 30px rgba(57, 255, 20, 0.1)',
          background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)',
          maxHeight: 'calc(100vh - 4rem)',
        }}
      >
        {/* Image Container - Centered and Scaled Down */}
        <div className="w-full max-w-xs md:max-w-md h-60 md:h-80 flex items-center justify-center mb-8 md:mb-10 flex-shrink-0">
          <div
            ref={imageRef}
            className="w-full h-full rounded-xl overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 0 30px rgba(57, 255, 20, 0.3)' }}
          >
            <img
              src={currentTrend.image}
              alt={currentTrend.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full flex flex-col items-center text-center flex-shrink-0">
          <div ref={contentRef} className="w-full">
            {/* Title */}
            <h2 className="font-overlord text-2xl md:text-4xl lg:text-4xl text-[#39FF14] leading-tight mb-3 md:mb-4 uppercase drop-shadow-lg">
              {currentTrend.name}
            </h2>

            {/* Description */}
            <p className="text-light-100 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 font-light line-clamp-3">
              {currentTrend.description}
            </p>

            {/* Stats */}
            <div className="bg-neutral-900/80 border border-neutral-700 rounded-lg p-3 md:p-4 mb-6 md:mb-8 backdrop-blur-sm w-full flex-shrink-0">
              <div className="mb-3">
                <div className="flex justify-between text-xs text-light-100 mb-2">
                  <span className="font-medium uppercase tracking-wider text-[10px] md:text-xs">Viral Sentiment</span>
                  <span className="text-[#39FF14] font-bold text-base md:text-lg">{upPct}%</span>
                </div>
                <div className="w-full h-2 md:h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-2 md:h-3 bg-gradient-to-r from-[#39FF14] to-[#39FF14]/50 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${upPct}%`, boxShadow: '0 0 10px rgba(57, 255, 20, 0.6)' }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs md:text-sm text-light-100 font-medium">
                <span>👍 {currentTrend.upBettors} voters</span>
                <span>👎 {currentTrend.downBettors} voters</span>
              </div>
            </div>

            {/* Spacing */}
            <div className="h-3 md:h-4 flex-shrink-0"></div>

            {/* Status & Buttons */}
            {currentTrend.finalized ? (
              <div className="text-center py-3 md:py-4 bg-gradient-custom rounded-lg text-sm md:text-base font-bold uppercase tracking-wider flex-shrink-0">
                {currentTrend.result === 0 ? '🔥 Went Viral!' : '❌ Did Not Trend'}
              </div>
            ) : isExpired ? (
              <div className="text-center py-3 md:py-4 bg-orange-900/30 border border-orange-600 rounded-lg text-sm md:text-base text-orange-300 font-bold uppercase tracking-wider flex-shrink-0">
                ⏳ Awaiting Finalization
              </div>
            ) : (
              <>
                <div className="flex gap-3 md:gap-4 mb-3 md:mb-4 w-full flex-shrink-0">
                  <button
                    onClick={() => handleBet(0)}
                    disabled={isAnimating}
                    className="flex-1 py-3 md:py-4 bg-[#39FF14] text-black font-bold text-xs md:text-base uppercase rounded-lg hover:bg-[#2fd910] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    style={{ boxShadow: '0 0 20px rgba(57, 255, 20, 0.4)' }}
                  >
                    Will Go Viral
                  </button>
                  <button
                    onClick={() => handleBet(1)}
                    disabled={isAnimating}
                    className="flex-1 py-3 md:py-4 bg-red-600 text-white font-bold text-xs md:text-base uppercase rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
                  >
                    Will Not Trend
                  </button>
                </div>

                {/* Timer */}
                <p className="text-center text-xs md:text-sm text-light-100 font-light tracking-widest flex-shrink-0">
                  ⏱ {Math.floor(timeLeft / 60)}m {timeLeft % 60}s remaining
                </p>
              </>
            )}
          </div>

          {/* Carousel Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6 md:mt-8 flex-shrink-0">
            {trends.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'bg-[#39FF14] w-2 md:w-3 h-2 md:h-3 shadow-lg'
                    : 'bg-neutral-600 w-1.5 md:w-2 h-1.5 md:h-2 hover:bg-neutral-500'
                }`}
                aria-label={`Go to trend ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Right */}
      <button
        onClick={() => navigate('next')}
        disabled={isAnimating}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-30"
        aria-label="Next trend"
      >
        <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-[#39FF14] rounded-full flex items-center justify-center hover:bg-[#39FF14]/10 transition-all duration-300 disabled:opacity-30 cursor-pointer hover:scale-110"
        style={{ opacity: isAnimating ? 0.3 : 1 }}>
          <svg className="w-6 h-6 md:w-8 md:h-8 text-[#39FF14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </section>
  );
}
