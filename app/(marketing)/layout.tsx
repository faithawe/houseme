export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-3xl px-4 py-12">{children}</div>;
}
