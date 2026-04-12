'use client';

import { useState, useRef, useEffect } from 'react';
import navLinks from '@/constants/index.ts';
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // 1. Initialize the wallet hooks
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  // Get first 3 characters of address
  const shortAddress = publicKey ? publicKey.toString().slice(0, 3) + '..' : '';

  // 2. Handle the click event
  const handleWalletClick = () => {
    if (!connected) {
      setVisible(true); // Open the Phantom modal
    } else {
      setDropdownOpen(!dropdownOpen); // Toggle dropdown when connected
    }
  };

  // 3. Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    setDropdownOpen(false);
  };

  // 4. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header>
        <nav>
            <img src="/assets/logo.svg" alt="logo" className="h-6 md:h-8 w-auto invert" />

            <ul className="hidden md:flex text-light-100 font-light text-sm gap-8">
                {navLinks.map(({label, href}) => (
                    <li key={label}>
                    <a href={href}>{label}</a>
                    </li>
                ))}
            </ul>

            <div className="flex items-center gap-3">
                <img src="/assets/search.svg" alt="search" className="w-5 h-5 md:w-6 md:h-6" />
                
                {/* Wallet Button with Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button 
                    onClick={handleWalletClick}
                    className="relative transition-transform duration-200 hover:scale-110 flex items-center gap-2"
                    aria-label="Connect Wallet"
                  >
                      <div className="relative">
                        <img 
                          src="/assets/wallet.svg" 
                          className={`h-5 md:h-6 w-auto ${connected ? '' : 'brightness-5 invert'}`} 
                          alt="Connect Wallet" 
                        />
                        
                        {/* Pulsing green indicator when connected */}
                        {connected && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                        )}
                      </div>
                      
                      {/* Show address when connected */}
                      {connected && (
                        <span className="hidden md:block text-light-100 text-xs font-regular uppercase">{shortAddress}</span>
                      )}
                  </button>

                  {/* Glass Morphism Dropdown */}
                  {connected && dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg backdrop-blur-md bg-black/40 border border-white/20 shadow-2xl overflow-hidden z-50">
                      <a
                        href="/dashboard"
                        className="block px-4 py-3 text-light-100 text-sm font-regular uppercase hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                      >
                        Dashboard
                      </a>
                      <button
                        onClick={handleDisconnect}
                        className="w-full text-left px-4 py-3 text-light-100 text-sm font-regular uppercase hover:bg-white/10 transition-colors duration-200"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex flex-col gap-1.5 transition-all duration-300"
                  aria-label="Toggle mobile menu"
                >
                  <span className={`h-1 w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                  <span className={`h-1 w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`h-1 w-5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden fixed top-[7vh] left-0 w-full bg-black/95 border-b border-white/10 backdropblur-md z-40"
          >
            <ul className="flex flex-col gap-0 py-4">
              {navLinks.map(({label, href}) => (
                <li key={label}>
                  <a 
                    href={href}
                    className="block px-6 py-3 text-light-100 text-sm font-regular uppercase hover:bg-white/10 transition-colors duration-200 border-b border-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
    </header>
  );
}