'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 19.5a7.5 7.5 0 0115 0" />
    </svg>
  );
}

function CreateFishIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 12.2c1.9-2.9 4.9-4.8 8.1-4.8 2 0 3.8.6 5.4 1.7l2-1.2-.6 2.5c.5.8.8 1.7.8 2.7s-.3 1.9-.8 2.7l.6 2.5-2-1.2c-1.6 1.1-3.4 1.7-5.4 1.7-3.2 0-6.2-1.9-8.1-4.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M15.2 9.1l4.1-2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.2 14.9l4.1 2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SidebarLink({ href, label, icon, active }: SidebarItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${active ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_24px_rgba(0,0,0,0.35)]' : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'}`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${active ? 'border-white/15 bg-[#39FF14]/12 text-[#d7ffca]' : 'border-white/10 bg-black/20 text-white/70 group-hover:border-white/15 group-hover:bg-white/[0.06]'}`}>
        {icon}
      </span>
      <span className="uppercase tracking-[0.22em]">{label}</span>
    </Link>
  );
}

export default function GlassSidebarShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { disconnect, connected } = useWallet();

  const items: SidebarItem[] = [
    { href: '/discover', label: 'Home', icon: <HomeIcon className="h-4 w-4" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon className="h-4 w-4" /> },
    { href: '/create-fish', label: 'Create Fish', icon: <CreateFishIcon className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });

    if (connected) {
      disconnect();
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-black text-white selection:bg-[#AB9FF2] selection:text-black">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(57,255,20,0.15)_0%,_rgba(0,0,0,0)_72%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(8,148,255,0.12)_0%,_rgba(0,0,0,0)_75%)] blur-3xl" />

      <aside className="relative z-10 hidden w-64 flex-col justify-between bg-white/[0.03] p-6 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06),0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl md:flex">
        <div>
          <div className="mb-12">
            <img src="/assets/logo.svg" alt="DevMatrix" className="h-8 w-auto invert opacity-90 transition-opacity hover:opacity-100" />
          </div>

          <nav className="flex flex-col gap-3">
            {items.map((item) => {
              const isActive = item.href === '/discover'
                ? pathname === '/discover' || pathname?.startsWith('/discover/')
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return <SidebarLink key={item.href} {...item} active={Boolean(isActive)} />;
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-zinc-500 transition hover:bg-white/[0.05] hover:text-red-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}