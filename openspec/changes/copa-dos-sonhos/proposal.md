## Why

O WorldCup Pyramid é um puzzle passivo de ~2 minutos jogado uma vez por dia. Adicionar um modo de sessão ativa com maior rejogabilidade — onde o usuário monta um dream team de jogadores históricos e simula uma Copa do Mundo — expande o apelo do produto sem conflitar com o puzzle diário. O timing é ideal: a Copa 2026 está em curso e o interesse em craques históricos está em alta.

## What Changes

- Novo modo de jogo **Copa dos Sonhos**: simulador de Copa do Mundo com draft de jogadores históricos de diferentes seleções e edições
- Fase de Draft: 11 picks, cada um sorteando uma seleção + edição da Copa → usuário escolhe 1 jogador para seu time
- Fase de Torneio: 7 jogos simulados (3 grupos + oitavas + quartas + semi + final) com gols minuto a minuto
- 8 formações táticas selecionáveis (4-3-3, 4-4-2, 4-2-3-1, 4-2-4, 3-5-2, 5-3-2, 4-5-1, 3-4-3)
- 2 modos de dificuldade: Clássico (ratings visíveis) e Almanaque (ratings ocultos)
- Sistema de re-sorteio: 3 tentativas por pick (↺ seleção ou ↺ Copa independentemente)
- SEED único por campanha — resultado determinístico e compartilhável
- Card de campanha compartilhável com stats (vitórias, gols pró/contra)
- Novos scripts Python para coletar elencos históricos 1966–2022 com ratings
- Novo modelo de dados: `cup_editions`, `cup_squads`, `cup_players`

## Capabilities

### New Capabilities

- `dream-team-draft`: Mecânica de draft com roll de seleção+Copa, seleção de jogadores, atribuição a slots de formação, re-sorteio e box score em tempo real
- `tournament-simulation`: Engine de simulação de torneio com fase de grupos, knockout, geração de gols por minuto, SEED, modos de revelação e stats finais
- `copa-data-pipeline`: Scripts Python para coleta offline de elencos históricos de Copas 1966–2022 com posições e ratings; tabelas Supabase correspondentes
- `campaign-card`: Card compartilhável da campanha com formação, jogadores, scores e deep link via SEED

### Modified Capabilities

- `game-modes`: Adiciona Copa dos Sonhos como terceiro modo de jogo (além de Pyramid e futuras adições)

## Impact

- **Novas rotas:** `app/copa-dos-sonhos/page.tsx` (home/seleção de modo), `app/copa-dos-sonhos/draft/page.tsx`, `app/copa-dos-sonhos/simulacao/page.tsx`
- **Novos componentes:** FormationPitch, PlayerPoolRow, DraftRollPanel, BoxScore, TournamentBracket, MatchReveal, CampaignCard
- **Banco de dados:** 3 novas tabelas Supabase (`cup_editions`, `cup_squads`, `cup_players`) + migração
- **Scripts Python:** `scripts/fetch_cup_squads.py`, `scripts/build_ratings.py`
- **Sem dependências novas de npm** — @dnd-kit não necessário (sem drag; é click-to-assign)
- **Sem impacto** no puzzle diário existente (Pyramid)
