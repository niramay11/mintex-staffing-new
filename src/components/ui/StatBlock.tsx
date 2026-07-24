export default function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-navy sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-navy/60">{label}</p>
    </div>
  );
}
