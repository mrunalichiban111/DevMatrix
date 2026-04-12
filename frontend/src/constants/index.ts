interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'HOME', href: '/' },
  { label: 'TRENDS', href: '/trends' },
  { label: 'MINT TREND', href: '/mint-trend' },
  { label: 'ABOUT US', href: '/about-us' },
];

export default navLinks;