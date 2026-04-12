import type { Metadata } from 'next';
import './globals.css';
import { WalletContextProvider } from '../components/WalletContextProvider';

export const metadata: Metadata = {
  title: 'Trendifi',
  description: 'Predict and trade viral trends with Trendifi. Bet on what will go viral, trade attention like markets, and stay ahead of the curve.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
        {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
