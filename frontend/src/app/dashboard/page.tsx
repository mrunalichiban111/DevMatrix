'use client';

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <section className="w-full min-h-screen bg-black text-light-100">
      <div className="container mx-auto px-5 2xl:px-0 py-20">
        
        {!connected ? (
          // Not Connected State
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-white font-bold text-4xl md:text-6xl uppercase mb-4 text-center">
              Connect Your Wallet
            </h1>
            <p className="text-light-100 text-lg max-w-2xl text-center mb-8">
              To access your dashboard and manage your portfolio, please connect your wallet.
            </p>
            <button
              onClick={() => setVisible(true)}
              className="px-8 py-3 bg-primary text-white rounded font-semibold uppercase hover:opacity-80 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          // Connected State - Full Dashboard
          <>
            {/* Header */}
            <div className="mb-16">
              <h1 className="text-white font-bold text-3xl md:text-5xl uppercase mb-4">
                Your Dashboard
              </h1>
              <p className="text-light-100 text-lg max-w-2xl">
                Welcome back! Manage your portfolio, trends, and account settings.
              </p>
            </div>

            {/* Wallet Info Card */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                <h2 className="text-white font-bold text-xl uppercase mb-4">Wallet Info</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-dark-100 text-xs uppercase">Address</p>
                    <p className="text-white font-semibold text-sm break-all">{publicKey?.toString()}</p>
                  </div>
                  <div>
                    <p className="text-dark-100 text-xs uppercase">Status</p>
                    <p className="text-green-400 font-semibold text-sm">Connected</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 flex flex-col justify-center">
                <h3 className="text-white font-semibold text-lg uppercase mb-2">Portfolio Value</h3>
                <p className="text-white text-3xl font-bold">$0.00</p>
                <p className="text-white/80 text-sm mt-2">Start by minting your first trend</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-12">
              <h2 className="text-white font-bold text-xl uppercase mb-6">Your Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Trends Created', value: '0' },
                  { label: 'Total Invested', value: '$0' },
                  { label: 'Wins', value: '0' },
                ].map((stat, i) => (
                  <div 
                    key={i}
                    className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 text-center"
                  >
                    <p className="text-dark-100 text-xs uppercase mb-2">{stat.label}</p>
                    <p className="text-white font-bold text-2xl">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Section */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h2 className="text-white font-bold text-xl uppercase mb-4">Recent Activity</h2>
              <div className="text-center py-12">
                <p className="text-dark-100 text-sm">No activity yet. Start minting trends to see your activity here.</p>
              </div>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
