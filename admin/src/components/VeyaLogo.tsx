/**
 * Veya brand mark.
 *
 * A rounded square filled with the brand gradient, carrying a geometric "V"
 * whose final stroke ascends into a detached node dot — the V stands for
 * Veya, the rising line evokes market movement, and the dot represents a
 * Web3 node. Rendered inline so it stays crisp at any size.
 */
export default function VeyaLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Veya logo"
    >
      <defs>
        <linearGradient
          id="veya-logo-gradient"
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#6A5CFF" />
          <stop offset="1" stopColor="#00C8FF" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#veya-logo-gradient)" />
      {/* V stroke rising into the node dot. */}
      <path
        d="M13 14 L20 33 L26 21 L31.5 15.5"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="13" r="3" fill="#FFFFFF" />
    </svg>
  );
}
