import GlassSidebarShell from '@/components/GlassSidebarShell';

export default function CreateFishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GlassSidebarShell>{children}</GlassSidebarShell>;
}