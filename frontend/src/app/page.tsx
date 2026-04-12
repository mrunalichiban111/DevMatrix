'use client';

import Hero from '@/components/Hero';
import ModelSection from '@/components/ModelSection';
import Navbar from '@/components/Navbar';
import Showcase from '@/components/Showcase';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ModelSection />
      <Showcase />
      <Footer />
    </main>
  );
}

