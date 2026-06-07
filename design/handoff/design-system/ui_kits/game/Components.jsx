/* FutCopa game — presentational components */

const FC_COUNTRY_GRAD = {
  "Alemanha":  "linear-gradient(135deg,#2b3b33,#16261e)",
  "Brasil":    "linear-gradient(135deg,#08b65a,#06934a)",
  "França":    "linear-gradient(135deg,#15b8e8,#0a93bd)",
  "Argentina": "linear-gradient(135deg,#6fd9f5,#15b8e8)",
  "Hungria":   "linear-gradient(135deg,#ff2e63,#e01250)",
  "Inglaterra":"linear-gradient(135deg,#ff9e1b,#f2ab00)"
};
const fcGrad = (c) => FC_COUNTRY_GRAD[c] || "linear-gradient(135deg,#46554d,#2b3b33)";
const fcInit = (n) => n.replace(/[^A-Za-zÀ-ÿ. ]/g,"").split(/[ .]+/).filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();

function Avatar({ player, size = 40 }) {
  return (
    <div className="fc-avatar" style={{ width: size, height: size, background: fcGrad(player.country) }}>
      {fcInit(player.name)}<span className="fl">{player.flag}</span>
    </div>
  );
}

/* shape+icon feedback mark (colorblind-safe) */
function FeedbackMark({ kind, size = 22 }) {
  if (kind === "correct") return (
    <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="var(--success)"/>
      <path d="M7 12.5l3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"><rect x="4.5" y="4.5" width="15" height="15" rx="3" transform="rotate(45 12 12)" fill="var(--error)"/>
      <path d="M9 9l6 6M15 9l-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/></svg>
  );
}

function TopBar({ onStats, onArchive, onHelp, theme, onTheme }) {
  return (
    <div className="fc-topbar">
      <div className="fc-wm">
        <img src="../../assets/logo-mark.svg" alt="" />
        <span className="txt"><span className="a">FUT</span><span className="b">COPA</span></span>
      </div>
      <button className="fc-iconbtn" onClick={onTheme} aria-label="Tema"><Icon name={theme==="dark"?"sun":"moon"} size={20} /></button>
      <button className="fc-iconbtn" onClick={onArchive} aria-label="Arquivo"><Icon name="calendar" size={20} /></button>
      <button className="fc-iconbtn" onClick={onStats} aria-label="Estatísticas"><Icon name="stats" size={20} /></button>
      <button className="fc-iconbtn" onClick={onHelp} aria-label="Como jogar"><Icon name="help" size={20} /></button>
    </div>
  );
}

function CategoryBadge({ category, puzzleNo }) {
  return (
    <div className="fc-cat">
      <div className="ic"><Icon name="trophy" size={20} /></div>
      <div>
        <div className="lab">Categoria do dia · #{puzzleNo}</div>
        <div className="ttl">{category.label}</div>
        <div className="desc">{category.desc}</div>
      </div>
    </div>
  );
}

function Slot({ index, rank, player, state, easyHint, onTap, justPlaced, flash }) {
  const cls = ["fc-slot"];
  if (state === "active") cls.push("fc-slot--active");
  else if (state === "correct") cls.push("fc-slot--correct");
  else if (state === "incorrect") cls.push("fc-slot--incorrect");
  else if (player) cls.push("fc-slot--filled");
  if (justPlaced) cls.push("placed");
  if (flash) cls.push("fc-slot--flash");
  return (
    <div className={cls.join(" ")} onClick={() => onTap && onTap(index)}>
      {easyHint && !player && <span className="rk">{rank}</span>}
      {!player && <span className="ph">{state === "active" ? "↓" : "+"}</span>}
      {player && <>
        <span className="sav" style={{ background: fcGrad(player.country) }}>{fcInit(player.name)}<span className="fl">{player.flag}</span></span>
        <span className="snm">{player.name}</span>
      </>}
      {(state === "correct" || state === "incorrect") &&
        <span className="mk"><FeedbackMark kind={state} /></span>}
    </div>
  );
}

/* Pyramid: rows of 1,2,3,4. placements: array length 10 of player|null. */
const FC_ROWS = [[0],[1,2],[3,4,5],[6,7,8,9]];
function Pyramid({ placements, results, activeSlot, easy, onSlotTap, lastPlaced, hinted = {} }) {
  return (
    <div className="fc-pyramid">
      {FC_ROWS.map((row, ri) => (
        <div className="fc-pyr-row" key={ri}>
          {row.map((i) => {
            let state = "empty";
            if (results) state = results[i] ? "correct" : (placements[i] ? "incorrect" : "empty");
            else if (i === activeSlot) state = "active";
            return <Slot key={i} index={i} rank={i+1} player={placements[i]} state={state}
                         easyHint={easy || !!hinted[i]} flash={!!hinted[i] && !placements[i]}
                         onTap={results ? null : onSlotTap} justPlaced={lastPlaced===i} />;
          })}
        </div>
      ))}
    </div>
  );
}

function PlayerQueue({ queue, activeId, onPick, easy }) {
  return (
    <div className="fc-queue">
      <div className="qhead">
        <span className="lab">Fila · toque para escolher</span>
        <span className="lab">{queue.length} restantes</span>
      </div>
      <div className="fc-qtrack">
        {queue.map((p) => (
          <div key={p.id} className={"fc-pcard" + (p.id===activeId ? " fc-pcard--active" : "")} onClick={() => onPick(p.id)}>
            <Avatar player={p} />
            <div>
              <div className="nm">{p.name}</div>
              <div className="co">{p.country}</div>
            </div>
          </div>
        ))}
        {queue.length === 0 && <div style={{padding:"10px 6px", color:"var(--fg-3)", font:"var(--t-body-sm)"}}>Pirâmide completa — confira e envie.</div>}
      </div>
    </div>
  );
}

function ModeSelect({ value, onChange }) {
  const modes = [
    { id: "facil",  emoji: "🟢", t: "Fácil",  d: "Mostra o nível certo (📍) de cada jogador como dica.", bg: "var(--success-bg)" },
    { id: "normal", emoji: "🔵", t: "Normal", d: "Sem dicas de nível. Você decide a ordem sozinho.", bg: "var(--info-bg)" }
  ];
  return (
    <div className="fc-modes">
      {modes.map(m => (
        <button key={m.id} className={"fc-mode" + (value===m.id ? " fc-mode--sel" : "")} onClick={() => onChange(m.id)}>
          <span className="badge" style={{ background: m.bg }}>{m.emoji}</span>
          <span><span className="t">{m.t}</span><div className="d">{m.d}</div></span>
        </button>
      ))}
    </div>
  );
}

function Toast({ icon = "check", children }) {
  return (
    <div className="fc-toast-wrap"><div className="fc-toast">
      <FeedbackMark kind="correct" size={18} />{children}
    </div></div>
  );
}

function Countdown({ label = "Próximo desafio em" }) {
  const [t, setT] = React.useState(() => {
    const n = new Date(); const e = new Date(n); e.setHours(24,0,0,0); return Math.floor((e-n)/1000);
  });
  React.useEffect(() => { const id = setInterval(() => setT(v => Math.max(0, v-1)), 1000); return () => clearInterval(id); }, []);
  const h = String(Math.floor(t/3600)).padStart(2,"0");
  const m = String(Math.floor((t%3600)/60)).padStart(2,"0");
  const s = String(t%60).padStart(2,"0");
  return <div className="fc-countdown"><div className="lab">{label}</div><div className="clk">{h}:{m}:{s}</div></div>;
}

Object.assign(window, { Avatar, FeedbackMark, TopBar, CategoryBadge, Slot, Pyramid, PlayerQueue, ModeSelect, Toast, Countdown, fcGrad, fcInit, FC_ROWS });
