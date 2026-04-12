'use client';
import navLinks from '@/constants/index.ts';
export default function Navbar() {
  return (
    <header>
        <nav>
            <img src="/assets/logo.svg" alt="logo" className="h-8 w-auto invert" />

            <ul className="text-light-100 font-light text-[10px] scale-75">
                {navLinks.map(({label}) => (
                    <li key={label}>
                    <a href={label.toLowerCase()}>{label}</a>
                    </li>
                ))}
            </ul>

            <div className="flex center gap-3">
                <img src="/assets/search.svg" alt="search" />
                <img src="/assets/wallet.svg" className="brightness-5 invert h-6 w-auto" alt="Connect Wallet" />
            </div>
        </nav>
    </header>
  );
}
