import type { Metadata } from 'next';
import './globals.css';
import { WalletContextProvider } from '../components/WalletContextProvider';
import { GSAPInitializer } from '../components/GSAPInitializer';
import SessionProviderWrapper from '../components/SessionProviderWrapper';

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
        <SessionProviderWrapper>
          <GSAPInitializer />
          <WalletContextProvider>
          {children}
          </WalletContextProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
