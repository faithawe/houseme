import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="roof" x1="24" y1="4" x2="24" y2="22">
              <stop stopColor="#C4AE62" />
              <stop offset="0.45" stopColor="#A6904A" />
              <stop offset="1" stopColor="#85733A" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="29" r="11" stroke="#0A0A0A" strokeWidth="3" />
          <path
            d="M24 37.5V30"
            stroke="#737373"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          <path d="M5 19.5 24 4 43 19.5Z" fill="url(#roof)" />
        </svg>
      </div>
    ),
    size,
  );
}
