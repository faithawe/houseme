export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-slip px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold text-navy">{title}</p>
      <p className="mt-2 text-sm text-navy/70">{description}</p>
    </div>
  );
}
