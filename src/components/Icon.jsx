// 선으로 그린 아이콘 모음 (이모지 대신 사용)
const PATHS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  won: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 9l2 6.5L12 9l2.5 6.5 2-6.5M7 12h10" />
    </>
  ),
  send: <path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z" />,
  store: (
    <>
      <path d="M4 10v9a1 1 0 001 1h14a1 1 0 001-1v-9" />
      <path d="M3 10l2-6h14l2 6a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2.2 2.2L15 10" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M3 9h18M12 9v11M12 9c-1.5-4-6-4-5-1 .5 1.5 3 1 5 1zm0 0c1.5-4 6-4 5-1-.5 1.5-3 1-5 1z" />
    </>
  ),
}

export default function Icon({ name, size = 24 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
