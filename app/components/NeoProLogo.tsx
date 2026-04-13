export default function NeoProLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="0" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="capGrad" x1="30" y1="35" x2="70" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>
      </defs>

      {/* Shield body */}
      <path
        d="M50 5 C25 5, 10 15, 10 35 L10 60 C10 82, 28 98, 50 108 C72 98, 90 82, 90 60 L90 35 C90 15, 75 5, 50 5Z"
        fill="url(#shieldGrad)"
        stroke="url(#shieldStroke)"
        strokeWidth="2"
      />

      {/* Graduation cap - top diamond */}
      <polygon
        points="50,32 75,44 50,56 25,44"
        fill="url(#capGrad)"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Cap base/band */}
      <path
        d="M35 48 L35 62 C35 68, 42 74, 50 74 C58 74, 65 68, 65 62 L65 48"
        fill="url(#capGrad)"
        stroke="white"
        strokeWidth="2"
        fillOpacity="0.7"
      />

      {/* Tassel string */}
      <line x1="75" y1="44" x2="75" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Tassel end */}
      <line x1="75" y1="68" x2="75" y2="76" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
