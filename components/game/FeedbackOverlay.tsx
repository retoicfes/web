"use client";

type Props = {
  correcto: boolean;
  explicacion: string;
  fraseExtra?: string;
};

export function FeedbackOverlay({ correcto, explicacion, fraseExtra }: Props) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border px-5 py-6 safe-pb ${
        correcto
          ? "border-green-500/40 bg-green-950/95"
          : "border-red-500/40 bg-red-950/95"
      }`}
    >
      <p className="text-lg font-bold">{correcto ? "¡Bien! +10 pts 🎉" : "Ups…"}</p>
      {!correcto && fraseExtra ? (
        <p className="mt-1 text-sm text-red-200">{fraseExtra}</p>
      ) : null}
      <p className="mt-2 text-sm text-slate-200">{explicacion}</p>
    </div>
  );
}
