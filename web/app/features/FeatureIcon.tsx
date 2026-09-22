const paths = {
  camera: "M8 5l1.5-2h5L16 5h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h3 M16 12a4 4 0 11-8 0 4 4 0 018 0",
  import: "M12 3v12m-4-4l4 4 4-4 M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4",
  album: "M7 3h12a2 2 0 012 2v12 M5 7h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2 M3 17l4-4 3 3 2-2 5 5 M7 11h.01",
  chart: "M4 3v17h17 M7 14l4-5 4 3 5-7",
  future: "M4 5h16v15H4z M8 2v6m8-6v6 M4 11h16 M9 16h6m-2-2l2 2-2 2",
  target: "M20 12a8 8 0 11-8-8 M16 12a4 4 0 11-4-4 M12 12l9-9m-5 0h5v5",
  calendar: "M7 3v4m10-4v4 M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2 M3 10h18 M8 15l3 3 5-5",
  connections: "M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-2 2 M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l2-2",
  food: "M4 3v5a3 3 0 006 0V3 M7 3v18 M19 21V3c-4 3-5 7-5 10h5",
  share: "M12 15V3m-4 4l4-4 4 4 M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
  shield: "M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3 M8 12l3 3 5-6",
  rewind: "M3 10a9 9 0 119 11 M3 4v6h6 M12 7v5l4 2",
  arrow: "M4 12h16m-6-6l6 6-6 6",
  check: "M5 12l4 4L19 6",
} as const;

export type FeatureIconName = keyof typeof paths;

export default function FeatureIcon({ name, className }: { name: FeatureIconName; className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
}

export function FoodIllustration({ food }: { food: "eggs" | "toast" }) {
  return (
    <svg width="44" height="44" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      {food === "eggs" ? <>
        <ellipse cx="32" cy="45" rx="25" ry="10" fill="#e8eaf0" />
        <path d="M9 33c-1-7 6-11 12-13 3-9 12-12 19-7 7-1 15 5 13 13 6 5 7 12 2 17-5 6-12 6-18 4-7 5-16 4-20-2-7-1-11-7-8-12Z" fill="#fff" stroke="#d0d4df" strokeWidth="1.5" />
        <circle cx="32" cy="30" r="11" fill="#e6ad4a" />
        <path d="M26 27a7 7 0 015-4" stroke="#f8dba0" strokeWidth="3" strokeLinecap="round" />
      </> : <>
        <ellipse cx="32" cy="51" rx="22" ry="5" fill="#e8eaf0" />
        <path d="M14 28C3 17 15 9 32 9s29 8 18 19v20a4 4 0 01-4 4H18a4 4 0 01-4-4V28Z" fill="#bc814c" stroke="#a36d3d" strokeWidth="1.5" />
        <path d="M19 27c-9-8 1-13 13-13s22 5 13 13v19H19V27Z" fill="#efd4a1" />
        <path d="M25 26h2m9 8h2m-13 6h2m8-18h2" stroke="#d4ae75" strokeWidth="2" strokeLinecap="round" />
      </>}
    </svg>
  );
}
