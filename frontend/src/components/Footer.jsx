export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neonCyan to-transparent opacity-40" />
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} LinkChat. All rights reserved.
      </div>
    </footer>
  );
}