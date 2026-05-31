import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010101] px-6 text-white">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#0D2DCD]">
        404
      </p>
      <h1 className="font-anton mt-4 text-3xl uppercase">Page not found</h1>
      <p className="mt-3 text-sm text-white/50">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[#0D2DCD] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
