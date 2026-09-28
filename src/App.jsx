import { useEffect, useRef, useState } from "react";
import { faces, heartPath } from "./buddy.js";
import { createMusic } from "./music.js";

// ===== ปรับแต่งตรงนี้ =====
const HER_NAME = "";   // หรือส่งลิงก์แบบ https://เว็บคุณ.vercel.app/?to=ชื่อ
// ==========================

const NAME = new URLSearchParams(window.location.search).get("to") || HER_NAME;

const LINES = [
  "เป็นแค่เพื่อนกันเถอะ", "แน่ใจเหรอ?", "คิดดีๆ ก่อนนะ", "จับไม่ได้หรอก~",
  "ปุ่มชมพูน่ากดกว่านะ", "ไม่เอาน่าา", "ลองอีกทีสิ", "เหนื่อยยังงง",
  "ใจร้ายจัง", "ยังไม่ยอมแพ้อีก?",
];

// ส่งเหตุการณ์ไปที่ /api/log (Vercel function) ซึ่งจะส่งต่อเข้า Google Sheet
function logEvent(event, dodges, message) {
  return fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, to: NAME, dodges, message }),
    keepalive: true,
  })
    .then((r) => r.ok)
    .catch(() => false);
}

const Heart = ({ fill = "#fff" }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.8 4.2 7.3C19.5 16.4 12 21 12 21z"
      fill={fill} stroke="#3b2a2a" strokeWidth="2" />
  </svg>
);

export default function App() {
  const [stage, setStage] = useState("intro"); // intro | ask | yes
  const [face, setFace] = useState({ name: "shy", anim: null, key: 0 });
  const [dodges, setDodges] = useState(0);
  const [noPos, setNoPos] = useState(null);
  const [musicOn, setMusicOn] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [msg, setMsg] = useState("");
  const [sendState, setSendState] = useState("idle"); // idle | sending | sent | error

  const cardRef = useRef(null), yesRef = useRef(null), noRef = useRef(null);
  const buddyRef = useRef(null), toRef = useRef(null), h1Ref = useRef(null), musicBtnRef = useRef(null);
  const musicRef = useRef(null);
  const lastMove = useRef(0);
  const dodgesRef = useRef(0);
  const stageRef = useRef(stage);
  stageRef.current = stage;

  const music = () => (musicRef.current ??= createMusic());
  const changeFace = (name, anim = "wiggle") =>
    setFace((f) => ({ name, anim, key: f.key + 1 }));

  function openLetter() {
    if (music().start()) setMusicOn(true);
    setStage("ask");
    changeFace("shy");
    logEvent("opened", 0);
  }

  function toggleMusic() {
    if (music().isOn()) { music().stop(); setMusicOn(false); }
    else if (music().start()) setMusicOn(true);
  }

  function moveNo(e) {
    if (e && e.cancelable) e.preventDefault();
    const card = cardRef.current, no = noRef.current, yes = yesRef.current;
    if (!card || !no || !yes) return;
    lastMove.current = Date.now();
    const d = ++dodgesRef.current;
    setDodges(d);
    changeFace(d % 2 ? "tease" : "nervous");

    const pad = 14, w = no.offsetWidth, h = no.offsetHeight;
    const maxX = Math.max(pad, card.clientWidth - w - pad);
    const maxY = Math.max(pad, card.clientHeight - h - pad);
    const curX = no.offsetLeft, curY = no.offsetTop;
    const box = (el) => [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight];
    const bb = buddyRef.current.getBoundingClientRect(), cb = card.getBoundingClientRect();
    const ys = 1.3;
    const avoid = [
      box(toRef.current), box(h1Ref.current), box(musicBtnRef.current),
      [bb.left - cb.left, bb.top - cb.top, bb.width, bb.height],
      [yes.offsetLeft - yes.offsetWidth * (ys - 1) / 2, yes.offsetTop - yes.offsetHeight * (ys - 1) / 2,
        yes.offsetWidth * ys, yes.offsetHeight * ys],
    ];
    const hits = (x, y) => avoid.some(([ax, ay, aw, ah]) =>
      x < ax + aw + 8 && x + w > ax - 8 && y < ay + ah + 8 && y + h > ay - 8);
    let x, y, tries = 0;
    do {
      x = pad + Math.random() * (maxX - pad);
      y = pad + Math.random() * (maxY - pad);
      tries++;
      if (!hits(x, y) && Math.hypot(x - curX, y - curY) > 90) break;
    } while (tries < 80);

    if (!noPos) {
      // ครั้งแรก: ตรึงไว้ที่เดิมก่อน แล้วค่อยวิ่ง เพื่อให้มี transition
      setNoPos({ x: curX, y: curY });
      setTimeout(() => setNoPos({ x, y }), 20);
    } else {
      setNoPos({ x, y });
    }
  }

  // มือถือ: นิ้วแค่เข้าใกล้ปุ่มก็หนี
  useEffect(() => {
    const near = (e) => {
      if (stageRef.current !== "ask") return;
      const t = e.touches && e.touches[0], no = noRef.current;
      if (!t || !no) return;
      const r = no.getBoundingClientRect(), n = 50;
      if (t.clientX > r.left - n && t.clientX < r.right + n &&
          t.clientY > r.top - n && t.clientY < r.bottom + n &&
          Date.now() - lastMove.current > 250) moveNo();
    };
    document.addEventListener("touchstart", near, { passive: true });
    document.addEventListener("touchmove", near, { passive: true });
    return () => {
      document.removeEventListener("touchstart", near);
      document.removeEventListener("touchmove", near);
    };
  });

  // touchstart บนปุ่มต้องเป็น non-passive เพื่อกันไม่ให้กดโดน
  useEffect(() => {
    const no = noRef.current;
    if (!no) return;
    const h = (e) => moveNo(e);
    no.addEventListener("touchstart", h, { passive: false });
    return () => no.removeEventListener("touchstart", h);
  });

  // หน้าคำถาม: ล็อกไม่ให้เลื่อน / หน้าข้อความ: ให้เลื่อนได้ เผื่อคีย์บอร์ดมือถือบัง
  useEffect(() => {
    document.body.classList.toggle("scrollable", stage === "yes");
  }, [stage]);

  async function sendMessage() {
    const text = msg.trim();
    if (!text || sendState === "sending") return;
    setSendState("sending");
    const ok = await logEvent("message", dodgesRef.current, text);
    setSendState(ok ? "sent" : "error");
    if (ok) changeFace("shy");
  }

  function sayYes() {
    setStage("yes");
    changeFace("happy", "bounce");
    if (musicOn) music().celebrate(); // ถ้าปิดเพลงไว้ ก็ไม่ดังขึ้นมาเอง
    logEvent("yes", dodgesRef.current);
    const colors = ["#ff6b8b", "#ffb3c3", "#ff8fa6", "#ffd166"];
    setHearts(Array.from({ length: 26 }, (_, i) => ({
      id: i, color: colors[i % colors.length],
      left: Math.random() * 100, top: 72 + Math.random() * 28, delay: Math.random() * .9,
    })));
    setTimeout(() => setHearts([]), 3800);
  }

  const maxScale = (cardRef.current?.clientWidth ?? 420) < 400 ? 1.2 : 1.35;
  const yesScale = Math.min(1 + dodges * 0.04, maxScale);

  return (
    <>
      <div className={"intro" + (stage === "intro" ? "" : " gone")}>
        <div>
          <svg viewBox="0 0 220 160" aria-hidden="true">
            <rect x="10" y="20" width="200" height="130" rx="14" fill="#fff" stroke="#3b2a2a" strokeWidth="5" />
            <path d="M14 30l96 70 96-70" fill="#ffe4ec" stroke="#3b2a2a" strokeWidth="5" strokeLinejoin="round" />
            <path d="M14 142l70-52M206 142l-70-52" stroke="#3b2a2a" strokeWidth="4" strokeLinecap="round" />
            <path transform="translate(110 88) scale(1.7)" d="M0 7C-6-1-12 3-9 9c2 4 9 8 9 8s7-4 9-8c3-6-3-10-9-2z"
              fill="#ff6b8b" stroke="#3b2a2a" strokeWidth="2" />
          </svg>
          <p>{NAME ? `มีจดหมายถึง ${NAME}` : "มีจดหมายถึงเธอ"}</p>
          <button type="button" className="btn-pink" onClick={openLetter}>เปิดจดหมาย</button>
        </div>
      </div>

      <main className="card" ref={cardRef}>
        <button type="button" ref={musicBtnRef} className={"music" + (musicOn ? "" : " off")}
          aria-pressed={musicOn} aria-label="เปิดหรือปิดเพลง" onClick={toggleMusic}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#3b2a2a" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l11-2v13" />
            <circle cx="6.5" cy="18" r="2.8" fill="#ff6b8b" />
            <circle cx="17.5" cy="16" r="2.8" fill="#ff6b8b" />
            {!musicOn && <path d="M3 3l18 18" />}
          </svg>
        </button>

        <svg key={face.key} ref={buddyRef} className={"buddy" + (face.anim ? " " + face.anim : "")}
          viewBox="0 0 200 200" role="img" aria-label="ตัวการ์ตูนขนมโมจิ"
          dangerouslySetInnerHTML={{ __html: faces[face.name] }} />

        {stage !== "yes" ? (
          <section>
            <p className="to" ref={toRef}>{NAME ? `ถึง ${NAME}` : "ถึงเธอ"}</p>
            <h1 ref={h1Ref}>เราลองคุยกันดูไหม?</h1>
            <div className="choices">
              <button type="button" ref={yesRef} className="btn-pink yes"
                style={{ transform: `scale(${yesScale})` }} onClick={sayYes}>
                ลองคุยกันนะ <Heart />
              </button>
              <button type="button" ref={noRef}
                className={"no" + (noPos ? " running" : "")}
                style={noPos ? { left: noPos.x, top: noPos.y } : undefined}
                onMouseEnter={moveNo}
                onFocus={() => dodgesRef.current > 0 && moveNo()}
                onClick={(e) => moveNo(e)}>
                {LINES[dodges % LINES.length]}
              </button>
            </div>
          </section>
        ) : (
          <section className="result" aria-live="polite">
            <h2>เย้! ดีใจที่สุดเลย</h2>
            {sendState !== "sent" ? (
              <>
                <label htmlFor="msg" className="msg-label">มีอะไรฝากถึงเราไหม?</label>
                <textarea id="msg" className="msg" rows={4} maxLength={500}
                  placeholder="พิมพ์ได้เลย ไม่ต้องคิดเยอะ"
                  value={msg} onChange={(e) => setMsg(e.target.value)} />
                <div className="msg-row">
                  <span className="count">{msg.length}/500</span>
                  <button type="button" className="btn-pink send" onClick={sendMessage}
                    disabled={!msg.trim() || sendState === "sending"}>
                    {sendState === "sending" ? "กำลังส่ง..." : "ส่งข้อความ"}
                  </button>
                </div>
                {sendState === "error" && (
                  <p className="msg-error">ส่งไม่สำเร็จ ลองกดส่งอีกครั้งนะ</p>
                )}
              </>
            ) : (
              <p>ได้รับข้อความแล้ว เดี๋ยวทักไปนะ</p>
            )}
          </section>
        )}
      </main>

      {hearts.map((h) => (
        <svg key={h.id} className="float-heart" viewBox="-12 -2 24 22"
          style={{ left: `${h.left}vw`, top: `${h.top}vh`, animationDelay: `${h.delay}s` }}
          dangerouslySetInnerHTML={{ __html: heartPath(0, 0, 1, h.color) }} />
      ))}
    </>
  );
}
