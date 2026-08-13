/** ANIRX wordmark — square maroon frame around a cut "A". */
export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="ANIRX mark"
      className="shrink-0"
    >
      <rect x="7" y="7" width="50" height="50" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      <path
        d="M20 44 L32 18 L44 44 M25.5 34 H38.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
      />
    </svg>
  );
}
