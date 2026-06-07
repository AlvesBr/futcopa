## Context

Spec de referência: `openspec/specs/data-pipeline/spec.md`.

Os scripts Python existem apenas como esboço (`scripts/seed_puzzles.ts` existe em TypeScript para seed no Supabase; nenhum script Python foi criado). O `data/puzzles.json` contém 7 puzzles gerados manualmente pelo seed-puzzle-data change. `docs/puzzles.md` define os 30 puzzles com valores exatos e já revisados.

Há duas preocupações separadas:
1. **Coleta de dados brutos** — scripts de fetch para openfootball/FBRef/API-Football (infraestrutura reutilizável)
2. **Geração dos 30 puzzles** — `build_puzzles.py` que produz `data/puzzles.json`

## Goals / Non-Goals

**Goals:**
- Criar `scripts/fetch_openfootball.py`, `fetch_fbref.py`, `fetch_api_football.py` — ferramentas de coleta offline, usáveis agora e em futuras expansões
- Criar `scripts/build_players.py` — consolida `data/players.json` a partir dos dados dos puzzles
- Criar `scripts/build_puzzles.py` — gera todos os 30 puzzles em `data/puzzles.json` com `correct_level` calculado
- Criar `scripts/validate_puzzles.ts` — valida schema e regras de negócio do JSON gerado
- Criar `requirements.txt` e `data/raw/.gitkeep`

**Non-Goals:**
- Seed no Supabase (já coberto por `scripts/seed_puzzles.ts`)
- Fotos de jogadores (change separada)
- Puzzles além dos 30 já definidos

## Decisions

### Decisão 1: `build_puzzles.py` codifica os 30 puzzles como dados Python, não deriva dos raw files

**Escolhido:** Hardcode das definições em `build_puzzles.py`, usando os dados de `docs/puzzles.md`.

**Alternativa rejeitada:** Derivar dinamicamente dos arquivos `data/raw/`. Requereria que todos os fetch scripts tivessem rodado primeiro e que a lógica de consolidação fosse implementada por completo — complexidade desnecessária dado que os 30 puzzles já estão curados manualmente.

**Rationale:** Os dados em `docs/puzzles.md` são o output final de curadoria (valores verificados, empates documentados, ordem decidida). Codificá-los diretamente é determinístico, auditável e permite gerar os puzzles sem dependência de rede. Os fetch scripts são infraestrutura para expansão futura, não prerequisito dos 30 puzzles atuais.

**Consequência:** `build_puzzles.py` independe dos fetch scripts. Rodar `python scripts/build_puzzles.py` é suficiente para expandir o `data/puzzles.json` de 7 para 30 puzzles.

### Decisão 2: Player IDs seguem o padrão `{sobrenome}-{código-país}` (slugified)

**Escolhido:** `"klose-ger"`, `"messi-arg"`, `"ronaldo-bra"`, `"ronaldo-por"` — consistente com o `data/puzzles.json` existente.

**Rationale:** Permite diferenciar jogadores homônimos (Ronaldo Nazário vs Cristiano Ronaldo). Para "entidades de país" (puzzles dias 7, 11, 13, 17, 19, 20, 27, 29), usar `{país-slug}` como player_id.

### Decisão 3: `correct_level` calculado por `build_puzzles.py`, nunca armazenado manualmente

**Escolhido:** O script aplica `RANK_TO_LEVEL` (rank 1→1, 2-3→2, 4-6→3, 7-10→4) a cada jogador ao gerar o JSON.

**Rationale:** Elimina risco de inconsistência entre rank e level. O `data/puzzles.json` existente (7 puzzles) já tem `correct_level` correto — o script deve reescrever (ou pular se configurado via flag `--skip-existing`) esses 7 puzzles para não regredir.

### Decisão 4: Fetch scripts usam cache local (skip-if-exists) por padrão

**Escolhido:** Antes de cada request, verifica se o arquivo `data/raw/{nome}.json` já existe; se sim, pula.

**Rationale:** A API-Football tem limite de 100 req/dia. O FBRef bloqueia scraping agressivo. Cache local evita re-coleta acidental e é idempotente.

### Decisão 5: `validate_puzzles.ts` usa apenas `node:fs` + `node:path` (sem deps externas)

**Escolhido:** TypeScript puro, zero dependências além das já em `package.json` (`tsx` para rodar).

**Rationale:** O script já está referenciado no `package.json` como `"validate:puzzles": "tsx scripts/validate_puzzles.ts"`. Manter simples; erros fazem `process.exit(1)` para falhar CI.

## Risks / Trade-offs

- **FBRef pode bloquear** → Mitigation: delay 3s + User-Agent genérico; avisar no README que scripts são best-effort
- **Empates de valores nos puzzles** (ex: dias 1, 3, 5, 8, 12, 13, 22) → Mitigation: `build_puzzles.py` aceita `value` duplicado sem erro; `validate_puzzles.ts` só avisa (não falha) quando values repetidos ocorrem entre ranks do mesmo nível — a curadoria em `docs/puzzles.md` define o critério de desempate
- **`data/puzzles.json` sobrescrito com 30 puzzles** apaga os 7 existentes → Mitigation: `build_puzzles.py` reconstrói tudo do zero usando os dados hardcoded, incluindo os 7 primeiros puzzles com datas corretas

## Open Questions

- Nenhuma — os 30 puzzles estão definidos; as fontes estão documentadas; o schema já existe.
