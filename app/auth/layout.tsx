export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-palm-100 via-white to-white px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </div>
  );
}
