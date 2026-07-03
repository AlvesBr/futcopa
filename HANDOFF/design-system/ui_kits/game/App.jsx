/* FutCopa game — interactive click-thru app (state machine) */
const { useState, useEffect } = React;
const D = window.FC_DATA;

function shuffle(a) { const r = a.slice(); for (let i=r.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]]; } return r; }

function App() {
  const [theme, setTheme] = useState("light");
  const [screen, setScreen] = useState("home");     // home | mode | play
  const [mode, setMode] = useState("normal");
  const [modal, setModal] = useState(null);          // howto | help | result | stats | archive
  const [placements, setPlacements] = useState(Array(10).fill(null));
  const [queue, setQueue] = useState(D.players);
  const [activeId, setActiveId] = useState(null);
  const [results, setResults] = useState(null);
  const [score, setScore] = useState(0);
  const [lastPlaced, setLastPlaced] = useState(-1);
  const [toast, setToast] = useState(null);
  const [hinted, setHinted] = useState({});          // {slotIndex:true}

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 1900); return () => clearTimeout(id); }, [toast]);

  const easy = mode === "facil";
  const allPlaced = placements.every(Boolean);
  const activeSlot = activeId ? placements.findIndex(p => !p) : -1;

  function startGame() {
    setPlacements(Array(10).fill(null));
    const q = shuffle(D.players);
    setQueue(q); setActiveId(q[0].id); setResults(null); setHinted({}); setScreen("play");
  }

  function pick(id) { setActiveId(id); }

  function tapSlot(i) {
    if (results) return;
    if (placements[i]) {                 // unplace → back to queue
      const p = placements[i];
      const np = placements.slice(); np[i] = null; setPlacements(np);
      setQueue(q => [p, ...q]); setActiveId(p.id);
      return;
    }
    const active = queue.find(p => p.id === activeId) || queue[0];
    if (!active) return;
    const np = placements.slice(); np[i] = active; setPlacements(np);
    const nq = queue.filter(p => p.id !== active.id); setQueue(nq);
    setActiveId(nq[0] ? nq[0].id : null); setLastPlaced(i);
    setTimeout(() => setLastPlaced(-1), 360);
  }

  function submit() {
    const res = placements.map((p, i) => !!p && p.id === D.players[i].id);
    setResults(res); setScore(res.filter(Boolean).length); setModal("result");
  }

  function useHint() {
    setModal(null);
    const active = queue.find(p => p.id === activeId) || queue[0];
    if (!active) { setToast("Pirâmide cheia — nada para dicar."); return; }
    const correctIdx = D.players.findIndex(p => p.id === active.id);
    setHinted(h => ({ ...h, [correctIdx]: true }));
    setToast(`Dica: ${active.name} vai no nível destacado 📍`);
  }

  function share() {
    const ROWS = window.FC_ROWS;
    const grid = ROWS.map(r => r.map(i => results[i] ? "🟩" : "🟥").join("")).join("\n");
    const txt = `FutCopa #${D.puzzleNo} — ${score}/10\n${grid}\nfutcopa.com`;
    try { navigator.clipboard.writeText(txt); } catch (e) {}
    setToast("Copiado!");
  }

  return (
    <div className="fc-stage">
      <div className="fc-phone">
        {screen !== "home" &&
          <TopBar theme={theme} onTheme={() => setTheme(t => t==="dark"?"light":"dark")}
                  onStats={() => setModal("stats")} onArchive={() => setModal("archive")} onHelp={() => setModal("howto")} />}

        {screen === "home" && <HomeScreen theme={theme} onTheme={() => setTheme(t => t==="dark"?"light":"dark")}
                                onHowTo={() => setModal("howto")} onPlay={() => setScreen("mode")} />}

        {screen === "mode" && (
          <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
            <div className="fc-pad"><h1 className="fc-h1">Escolha o modo</h1><p className="fc-sub">Você pode trocar quando quiser.</p></div>
            <ModeSelect value={mode} onChange={setMode} />
            <div style={{ padding:"6px 18px 22px", marginTop:"auto" }}>
              <button className="fc-btn fc-btn--primary fc-btn--block" onClick={startGame}>Começar</button>
            </div>
          </div>
        )}

        {screen === "play" && (
          <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
            <CategoryBadge category={D.category} puzzleNo={D.puzzleNo} />
            <Pyramid placements={placements} results={results} activeSlot={activeSlot}
                     easy={easy} onSlotTap={tapSlot} lastPlaced={lastPlaced} hinted={hinted} />
            <div style={{ display:"flex", gap:10, padding:"0 16px" }}>
              <button className="fc-btn fc-btn--secondary" onClick={() => setModal("help")}><Icon name="hint" size={18} />Dica</button>
              <button className="fc-btn fc-btn--primary fc-btn--block" disabled={!allPlaced} onClick={submit}>
                {allPlaced ? "Enviar pódio" : `Faltam ${placements.filter(p=>!p).length}`}
              </button>
            </div>
            <PlayerQueue queue={queue} activeId={activeId} onPick={pick} easy={easy} />
          </div>
        )}

        {modal === "howto" && <HowToPlay onClose={() => setModal(null)} />}
        {modal === "help" && <HelpModal onConfirm={useHint} onClose={() => setModal(null)} />}
        {modal === "result" && <ResultModal score={score} players={D.players} placements={placements} results={results}
                                  streak={D.stats.streak} onShare={share} onStats={() => setModal("stats")} onClose={() => setModal(null)} />}
        {modal === "stats" && <StatsModal stats={D.stats} onClose={() => setModal(null)} />}
        {modal === "archive" && <ArchiveModal archive={D.archive} onClose={() => setModal(null)} />}

        {toast && <Toast>{toast}</Toast>}
      </div>
    </div>
  );
}

function HomeScreen({ onHowTo, onPlay, theme, onTheme }) {
  return (
    <div className="fc-home" style={{ display:"flex", flexDirection:"column", flex:1, textAlign:"center" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 14px 0" }}>
        <div className="fc-marquee"><span className="live" />Copa 2026 · Ao Vivo</div>
        <button className="fc-iconbtn" onClick={onTheme} aria-label="Tema"><Icon name={theme==="dark"?"sun":"moon"} size={20} /></button>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, padding:"0 24px" }}>
        <img src="../../assets/logo-mark.svg" alt="" style={{ width:96, height:96 }} />
        <div style={{ fontFamily:"var(--font-display)", textTransform:"uppercase", fontSize:64, lineHeight:.9, letterSpacing:"-.01em" }}>
          <span style={{ color:"var(--grass-300)" }}>FUT</span><span style={{ color:"var(--gold-400)" }}>COPA</span>
        </div>
        <p className="fc-sub" style={{ maxWidth:320, marginTop:10 }}>O gameshow para apaixonados por Copa do Mundo. Monte o pódio de 10 craques todo dia.</p>
        <Countdown />
      </div>
      <div style={{ padding:"0 22px 30px", display:"flex", flexDirection:"column", gap:10 }}>
        <button className="fc-btn fc-btn--primary fc-btn--block" onClick={onPlay}>Jogar agora</button>
        <button className="fc-btn fc-btn--ghost fc-btn--block" onClick={onHowTo}><Icon name="help" size={18} />Como jogar</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
