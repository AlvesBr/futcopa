## 1. Schema e Migração Supabase

- [x] 1.1 Criar migração `supabase/migrations/XXXX_copa_dos_sonhos.sql` com tabelas `cup_editions`, `cup_squads`, `cup_players`
- [x] 1.2 Criar `supabase/migrations/XXXX_copa_grants.sql` com grants de leitura anon nas novas tabelas
- [x] 1.3 Aplicar migração no ambiente local (`supabase db push`) e verificar schema — ⚠️ MANUAL: colar `supabase/migrations/20260605000002_copa_dos_sonhos.sql` e `20260605000003_copa_grants.sql` no SQL Editor do Supabase dashboard

## 2. Scripts Python — Coleta de Dados

- [x] 2.1 Criar `scripts/fetch_cup_squads.py` — coleta elencos 1966–2022 via openfootball + FBRef, gera `data/cup_squads.json`
- [x] 2.2 Criar `scripts/build_ratings.py` — lê `data/cup_squads.json`, calcula ratings 60–99 por jogador/campanha, gera `data/cup_players_rated.json`
- [x] 2.3 Criar `scripts/seed_copa_supabase.py` — popula `cup_editions`, `cup_squads`, `cup_players` via upsert usando SERVICE_ROLE_KEY
- [x] 2.4 Executar pipeline completo e verificar: ≥ 15 edições, ≥ 8 seleções/edição, ratings todos entre 60–99 — ⚠️ dados embutidos validados (3 edições ok); cobertura completa requer popular EMBEDDED_DATA em fetch_cup_squads.py ou rodar com FBRef (2006–2022)

## 3. Tipos e Client Supabase

- [x] 3.1 Adicionar tipos `CupEdition`, `CupSquad`, `CupPlayer`, `DraftState`, `CampaignResult` em `lib/types.ts`
- [x] 3.2 Criar `lib/cupData.ts` — funções `getCupEditions()`, `getSquadByEditionAndCountry()`, `getRandomRoll()` (sem chamadas externas em runtime)
- [x] 3.3 Criar `lib/simulation.ts` — PRNG `mulberry32`, `generateCampaign(team, seed)`, `simulateMatch(home, away, seed)`

## 4. Roteamento e Layout

- [ ] 4.1 Criar `app/copa-dos-sonhos/page.tsx` — home do modo com seleção de formação, dificuldade e botão iniciar
- [ ] 4.2 Criar `app/copa-dos-sonhos/draft/page.tsx` — página de draft (roll + pitch + box score)
- [ ] 4.3 Criar `app/copa-dos-sonhos/simulacao/page.tsx` — página de simulação com `?seed=` param
- [ ] 4.4 Adicionar link "Copa dos Sonhos" na home principal (`app/page.tsx`)

## 5. Componentes — Draft

- [ ] 5.1 Criar `components/copa/DraftRollPanel.tsx` — painel esquerdo: resultado do roll, lista de jogadores, botões re-sortear
- [ ] 5.2 Criar `components/copa/FormationPitch.tsx` — campo visual com slots posicionais por formação; destaque de slots compatíveis
- [ ] 5.3 Criar `components/copa/PlayerPoolRow.tsx` — linha de jogador no pool: número, nome, posição(ões), rating (ou "?" no modo Almanaque)
- [ ] 5.4 Criar `components/copa/BoxScore.tsx` — painel direito: contador picks, ratings ataque/defesa, lista posição → jogador → rating
- [ ] 5.5 Criar `components/copa/RerollControls.tsx` — botões "↺ Outra Seleção" e "↺ Outra Copa" com contador restante

## 6. Componentes — Simulação

- [ ] 6.1 Criar `components/copa/TournamentBracket.tsx` — exibição da chave com fases e resultados revelados progressivamente
- [ ] 6.2 Criar `components/copa/MatchReveal.tsx` — card de jogo com placar, gols por minuto (⚽ / ◦), flags dos times
- [ ] 6.3 Criar `components/copa/RevealControls.tsx` — toggle "Jogo a jogo / Automático" + botão "Revelar próximo"
- [ ] 6.4 Criar `components/copa/CampaignStats.tsx` — stats finais: fase alcançada, vitórias, gols pró/sofridos

## 7. Card Compartilhável

- [ ] 7.1 Criar `components/copa/CampaignCard.tsx` — card com formação visual, jogadores (seleção + edição), percurso e stats
- [ ] 7.2 Implementar `lib/campaignShare.ts` — gera URL com SEED e texto de compartilhamento pré-formatado
- [ ] 7.3 Adicionar botão "Copiar link" com feedback visual (toast/checkmark)

## 8. Estado e Persistência

- [ ] 8.1 Criar `lib/draftState.ts` — helpers para ler/escrever estado do draft em `sessionStorage`
- [ ] 8.2 Garantir que ao navegar draft→simulação o estado é passado via sessionStorage (não query string)
- [ ] 8.3 Implementar "↻ Repetir" — limpa sessionStorage e retorna ao início do draft

## 9. Verificação e Qualidade

- [ ] 9.1 Verificar build sem erros TypeScript: `npm run build`
- [ ] 9.2 Testar fluxo completo no browser: roll → 11 picks → simulação → card compartilhável
- [ ] 9.3 Testar modo Almanaque (ratings ocultos) e re-sorteio (limite de 3)
- [ ] 9.4 Testar compartilhamento via SEED: abrir URL gerada e verificar que a campanha reproduz
- [ ] 9.5 Verificar responsividade mobile (pitch + pool + box score em tela pequena)
