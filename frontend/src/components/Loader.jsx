export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-neonCyan/60 border-t-neonMagenta animate-spin" />
      <p className="text-white/70 text-sm">{label}</p>
    </div>
  );
}