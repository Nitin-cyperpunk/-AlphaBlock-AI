"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010101] px-6 text-white">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#0D2DCD]">
        Error
      </p>
      <h1 className="font-anton mt-4 text-2xl uppercase">Something went wrong</h1>
      <p className="mt-3 max-w-md text-center text-sm text-white/50">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-[#0D2DCD] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
