"use client";

export function QuizBackButton({
  onClick,
  disabled = false,
  label = "BACK",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label="Go back"
      className="font-label flex items-center gap-1.5 px-3 py-3"
      style={{
        fontSize: "0.65rem",
        letterSpacing: "0.18em",
        color: disabled ? "rgba(255,239,222,0.35)" : "rgba(255,239,222,0.85)",
        pointerEvents: disabled ? "none" : "auto",
        background: "none",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        minHeight: 44,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: "0.9rem" }}>←</span>
      {label}
    </button>
  );
}
