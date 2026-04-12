import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MintTrendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-[7vh]">
        {children}
      </main>
      <Footer />
    </>
  );
}
