/* FutCopa game — overlays: HowToPlay, Help confirm, Result, Stats, Archive */

function Sheet({ title, onClose, children, footer }) {
  return (
    <div className="fc-scrim" onClick={onClose}>
      <div className="fc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sh-head">
          <h2>{title}</h2>
          <button className="fc-iconbtn" onClick={onClose} aria-label="Fechar"><Icon name="x" size={20} /></button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

function HowToPlay({ onClose }) {
  const steps = [
    [<>Ordene <b>10 craques</b> em uma pirâmide de 4 níveis.</>],
    [<>O <b>topo</b> é o maior valor da categoria; a <b>base</b>, o menor.</>],
    [<>Toque num jogador da fila e depois no <b>slot</b> da pirâmide.</>],
    [<>Acertou o nível? <b>Círculo verde ✓</b>. Errou? <b>Losango vermelho ✕</b>.</>],
    [<>Uma categoria nova <b>todo dia</b>. Compartilhe seu resultado!</>]
  ];
  return (
    <Sheet title="Como jogar" onClose={onClose}
      footer={<button className="fc-btn fc-btn--primary fc-btn--block" onClick={onClose}>Entendi, bora jogar</button>}>
      <p className="fc-body-sm" style={{ marginTop: 0 }}>Estilo Wordle, com clima de Copa.</p>
      {steps.map((s, i) => (
        <div className="fc-howto-step" key={i}><span className="n">{i+1}</span><span className="tx">{s}</span></div>
      ))}
    </Sheet>
  );
}

function HelpModal({ onConfirm, onClose }) {
  return (
    <Sheet title="Usar uma dica?" onClose={onClose}
      footer={<div style={{ display:"flex", gap:10 }}>
        <button className="fc-btn fc-btn--secondary fc-btn--block" onClick={onClose}>Agora não</button>
        <button className="fc-btn fc-btn--gold fc-btn--block" onClick={onConfirm}><Icon name="hint" size={18} />Usar dica</button>
      </div>}>
      <div style={{ display:"flex", gap:13, alignItems:"flex-start" }}>
        <span className="fc-howto-step" style={{ margin:0 }}><span className="n" style={{ background:"var(--gold-400)", color:"var(--fg-on-gold)" }}>!</span></span>
        <p className="fc-body" style={{ margin:0 }}>Isto revela o <b>nível certo de 1 jogador</b> com um destaque na pirâmide. Você pode usar poucas dicas por dia.</p>
      </div>
    </Sheet>
  );
}

function ResultModal({ score, players, placements, results, streak, onShare, onStats, onClose }) {
  const msg = score >= 9 ? "Craque! 🏆" : score >= 7 ? "Mandou bem!" : score >= 4 ? "Quase lá!" : "Faltou pouco!";
  const ROWS = window.FC_ROWS;
  const cell = (ok) => ok ? "var(--success)" : "var(--error)";
  return (
    <Sheet title="Resultado" onClose={onClose}
      footer={<div style={{ display:"flex", gap:10 }}>
        <button className="fc-btn fc-btn--secondary fc-btn--block" onClick={onStats}><Icon name="stats" size={18} />Estatísticas</button>
        <button className="fc-btn fc-btn--gold fc-btn--block" onClick={onShare}><Icon name="share" size={18} />Compartilhar</button>
      </div>}>
      <div className="fc-result-hero">
        <div className="score">{score}/10</div>
        <div className="msg">{msg}</div>
        <div className="streak">Sequência: {streak} dias 🔥</div>
      </div>

      <div className="fc-section-lab">Seu pódio</div>
      <div className="fc-mini">
        {ROWS.map((row, ri) => (
          <div className="fc-mini-row" key={ri}>
            {row.map(i => <div className="fc-mini-cell" key={i} style={{ background: cell(results[i]) }} />)}
          </div>
        ))}
      </div>

      <div className="fc-section-lab">Pódio correto</div>
      <ol style={{ margin: "4px 0 0", padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {players.map((p, i) => (
          <li key={p.id} style={{ display:"flex", alignItems:"center", gap:8, background:"var(--surface-2)", borderRadius:"var(--r-sm)", padding:"6px 9px" }}>
            <b className="fc-mono" style={{ color:"var(--fg-3)", width:18 }}>{i+1}</b>
            <span style={{ fontSize:16 }}>{p.flag}</span>
            <span className="fc-body-sm" style={{ fontWeight:700, flex:1 }}>{p.name}</span>
            <b className="fc-mono" style={{ color:"var(--grass-600)" }}>{p.value}</b>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}

function StatsModal({ stats, onClose }) {
  const max = Math.max(...stats.dist);
  return (
    <Sheet title="Suas estatísticas" onClose={onClose}>
      <div className="fc-stat-row">
        <div className="fc-stat"><div className="v">{stats.played}</div><div className="k">Jogos</div></div>
        <div className="fc-stat"><div className="v">{stats.winRate}%</div><div className="k">Acerto</div></div>
        <div className="fc-stat"><div className="v">{stats.streak}</div><div className="k">Sequência</div></div>
        <div className="fc-stat"><div className="v">{stats.best}</div><div className="k">Recorde</div></div>
      </div>
      <div className="fc-section-lab">Distribuição de acertos (de 10)</div>
      <div className="fc-hist">
        {stats.dist.map((v, i) => (
          <div className="col" key={i}>
            <div className={"bar" + (i===stats.dist.length-1 ? " bar--hi" : "")} style={{ height: (v/max*88+6) + "px" }}></div>
            <div className="n">{i+2}</div>
          </div>
        ))}
      </div>
      <Countdown />
    </Sheet>
  );
}

function ArchiveModal({ archive, onClose }) {
  const color = (s) => s===null ? null : s>=9 ? "var(--grass-500)" : s>=7 ? "var(--gold-400)" : s>=4 ? "var(--cyan-500)" : "var(--magenta-500)";
  return (
    <Sheet title="Arquivo" onClose={onClose}>
      <p className="fc-body-sm" style={{ marginTop: 0 }}>Reveja desafios anteriores. A cor mostra seu placar.</p>
      <div className="fc-cal">
        {archive.map((s, i) => (
          <div key={i} className={"fc-day " + (s===null ? "fc-day--none" : "fc-day--played")}
               style={s===null ? {} : { background: color(s), color: s>=7 && s<9 ? "var(--fg-on-gold)" : "#fff" }}>
            {s===null ? (i+1) : s}
          </div>
        ))}
      </div>
    </Sheet>
  );
}

Object.assign(window, { Sheet, HowToPlay, HelpModal, ResultModal, StatsModal, ArchiveModal });
