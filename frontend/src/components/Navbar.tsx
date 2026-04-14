'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import navLinks from '@/constants/index.ts';
import { useWallet } from "@solana/wallet-adapter-react";
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authEntryFlow, setAuthEntryFlow] = useState<'manual' | 'google-return'>('manual');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initialize the wallet hooks
  const { connected, disconnect, publicKey } = useWallet();

  // Get first 3 characters of address
  const shortAddress = publicKey ? publicKey.toString().slice(0, 3) + '..' : '';

  useEffect(() => {
    if (searchParams.get('auth') !== 'google') {
      return;
    }

    setAuthEntryFlow('google-return');
    setAuthModalOpen(true);

    const basePath = pathname || '/';
    router.replace(basePath);
  }, [pathname, router, searchParams]);

  // 2. Handle the click event
  const handleUserClick = () => {
    if (!connected) {
      setAuthEntryFlow('manual');
      setAuthModalOpen(true); // Open custom auth modal
    } else {
      setDropdownOpen(!dropdownOpen); // Toggle dropdown when connected
    }
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
    setAuthEntryFlow('manual');
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
                <AuthModal
                  isOpen={authModalOpen}
                  onClose={handleCloseAuthModal}
                  entryFlow={authEntryFlow}
                  returnTo={`${pathname || '/'}?auth=google`}
                />
                {/* User Button with Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button 
                    onClick={handleUserClick}
                    className="relative transition-transform duration-200 hover:scale-110 flex items-center gap-2"
                    aria-label="User Profile"
                  >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white w-6 h-6">
                            <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        
                        {/* Pulsing green indicator when connected */}
                        {connected && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                        )}
                      
                      {/* Show address when connected */}
                      {connected && (
                        <span className="hidden md:block text-light-100 text-xs font-regular uppercase">{shortAddress}</span>
                      )}
                  </button>

                  {/* Glass Morphism Dropdown */}
                  {connected && dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg backdrop-blur-md bg-black/40 border border-white/20 shadow-2xl overflow-hidden z-50">
                      <a
                        href="/discover"
                        className="block px-4 py-3 text-light-100 text-sm font-regular uppercase hover:bg-white/10 transition-colors duration-200 border-b border-white/10"
                      >
                        Discover
                      </a>
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