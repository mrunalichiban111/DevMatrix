interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'HOME', href: '/#home' },
  { label: 'STATS', href: '/#stats' },
  { label: 'KNOW MORE', href: '/#know-more' },
  { label: 'USER JOURNEY', href: '/#user-journey' },
];

export default navLinks;