export default function AuraSvg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full object-cover"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient
          id="aura-grad-1"
          cx="50%"
          cy="40%"
          r="60%"
          fx="50%"
          fy="40%"
        >
          <stop offset="0%" stopColor="#5a3957" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3D233B" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="aura-grad-2"
          cx="30%"
          cy="70%"
          r="70%"
          fx="30%"
          fy="70%"
        >
          <stop offset="0%" stopColor="#86C4FB" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#3D233B" stopOpacity="0" />
        </radialGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="80" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#3D233B" />
      <g filter="url(#blur)">
        <circle cx="720" cy="450" r="500" fill="url(#aura-grad-1)" />
        <ellipse cx="400" cy="650" rx="600" ry="400" fill="url(#aura-grad-2)" />
      </g>
    </svg>
  );
}
