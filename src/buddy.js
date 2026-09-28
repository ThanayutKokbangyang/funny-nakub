// ตัวการ์ตูนโมจิ วาดด้วย SVG ทั้งหมด (ตัวละครออริจินัล)
const INK = "#3b2a2a";

export const heartPath = (x, y, s, fill) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 7C-6-1-12 3-9 9c2 4 9 8 9 8s7-4 9-8c3-6-3-10-9-2z" fill="${fill}" stroke="${INK}" stroke-width="${2.2 / s}"/>`;

const body = (arms) => `
  <ellipse cx="100" cy="186" rx="58" ry="8" fill="${INK}" opacity=".12"/>
  <circle cx="62" cy="66" r="16" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>
  <circle cx="138" cy="66" r="16" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>
  <ellipse cx="78" cy="176" rx="15" ry="9" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>
  <ellipse cx="122" cy="176" rx="15" ry="9" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>
  <path d="M100 58c44 0 74 30 74 66 0 32-30 52-74 52s-74-20-74-52c0-36 30-66 74-66z" fill="#ffe4cf" stroke="${INK}" stroke-width="5"/>
  <path d="M58 80c10-10 24-15 36-15" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
  ${arms}`;

const armsDown = `
  <ellipse cx="32" cy="138" rx="10" ry="13" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>
  <ellipse cx="168" cy="138" rx="10" ry="13" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>`;
const armsOnCheeks = `
  <ellipse cx="52" cy="134" rx="11" ry="13" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>
  <ellipse cx="148" cy="134" rx="11" ry="13" fill="#ffd9bd" stroke="${INK}" stroke-width="5"/>`;
const armsUp = `
  <ellipse cx="28" cy="96" rx="10" ry="13" fill="#ffd9bd" stroke="${INK}" stroke-width="5" transform="rotate(-25 28 96)"/>
  <ellipse cx="172" cy="96" rx="10" ry="13" fill="#ffd9bd" stroke="${INK}" stroke-width="5" transform="rotate(25 172 96)"/>`;
const blush = (op = 0.85) => `
  <ellipse cx="62" cy="126" rx="15" ry="9" fill="#ff8fa6" opacity="${op}"/>
  <ellipse cx="138" cy="126" rx="15" ry="9" fill="#ff8fa6" opacity="${op}"/>`;
const blushLines = `
  <path d="M52 122l-5 8M60 122l-5 8M68 122l-5 8M136 122l-5 8M144 122l-5 8M152 122l-5 8" stroke="#e0476a" stroke-width="2.5" stroke-linecap="round"/>`;

export const faces = {
  shy: body(armsOnCheeks) + blush(1) + blushLines + `
    <path d="M68 108q8 6 16 0M116 108q8 6 16 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M92 132q4-4 8 0t8 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    ${heartPath(162, 40, 1.4, "#ff6b8b")}`,
  tease: body(armsDown) + blush() + `
    <path d="M68 102l12 6-12 6" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="124" cy="108" r="7" fill="${INK}"/><circle cx="126" cy="105" r="2.2" fill="#fff"/>
    <path d="M88 130q12 10 24 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M100 134v6a6 6 0 0 0 12 0v-8" fill="#ff7d95" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
  nervous: body(armsDown) + blush(0.6) + `
    <circle cx="76" cy="108" r="7" fill="${INK}"/><circle cx="124" cy="108" r="7" fill="${INK}"/>
    <circle cx="78" cy="105" r="2.2" fill="#fff"/><circle cx="126" cy="105" r="2.2" fill="#fff"/>
    <path d="M86 134q5-6 10 0t10 0t10 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M158 76c-6 10-9 15-9 20a9 9 0 0 0 18 0c0-5-3-10-9-20z" fill="#9fd8ff" stroke="${INK}" stroke-width="3.5"/>`,
  happy: body(armsUp) + blush(1) + `
    <path d="M66 112q10-14 20 0M114 112q10-14 20 0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M84 126q16 0 32 0q0 22-16 22t-16-22z" fill="#c9425f" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M92 142q8-7 16 0" fill="#ff8fa6"/>
    ${heartPath(30, 40, 1.3, "#ff6b8b")}${heartPath(170, 34, 1.6, "#ff6b8b")}${heartPath(152, 12, 0.9, "#ffb3c3")}`,
};
