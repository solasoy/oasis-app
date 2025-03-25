export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a simple layout that just renders the children
  // It doesn't perform any authentication checks
  // This is important to prevent redirect loops
  return children;
}