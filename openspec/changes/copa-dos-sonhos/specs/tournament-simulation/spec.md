## ADDED Requirements

### Requirement: Geração determinística do torneio via SEED
O sistema SHALL gerar toda a campanha (adversários, gols, minutos) de forma determinística a partir de um SEED único, codificado na URL.

#### Scenario: SEED na URL
- **WHEN** o usuário chega à página de simulação
- **THEN** a URL contém um parâmetro `seed` (ex: `/simulacao?seed=1YYUVSJ`) que permite reproduzir a campanha exata

#### Scenario: Compartilhamento via SEED
- **WHEN** outro usuário acessa a URL com o mesmo SEED e o mesmo time
- **THEN** o sistema reproduz exatamente os mesmos resultados de todos os jogos

---

### Requirement: Estrutura da Copa — Grupos + Knockout
O sistema SHALL simular um torneio de 7 jogos: 3 na fase de grupos e 4 no mata-mata (oitavas, quartas, semi, final).

#### Scenario: Fase de grupos
- **WHEN** a simulação inicia
- **THEN** o time do usuário enfrenta 3 seleções históricas distintas sorteadas pelo SEED, escolhidas do pool elegível para aquela fase (ver Requirement: Pool de adversários por fase)

---

### Requirement: Pool de adversários por fase

O sistema SHALL selecionar adversários históricos escalando dificuldade conforme a fase, baseado no `avg_rating` de cada `cup_squad`.

#### Scenario: Rating range por fase
- **WHEN** a simulação sorteia adversários
- **THEN** usa os seguintes ranges de `avg_rating` por fase:
  - Grupos: 68–80 (ex: Costa Rica 2014, Austrália 2006)
  - Oitavas: 78–85 (ex: Suécia 1994, Colômbia 1990)
  - Quartas: 83–88 (ex: Portugal 2006, Alemanha 1982)
  - Semi: 86–92 (ex: França 1998, Brasil 2002)
  - Final: 88–99 (ex: Brasil 1970, Alemanha 1974)

#### Scenario: Exclusão de squads usados no draft
- **WHEN** o pool de adversários é gerado
- **THEN** os `cup_squads` cujo `id` foi usado no draft do usuário são excluídos do pool elegível — regra de exclusão por squad exato, não por seleção (ex: se o usuário draftou de Argentina 1998, pode ainda enfrentar Argentina 1986)

#### Scenario: Fallback quando pool está vazio
- **WHEN** nenhum squad elegível é encontrado no range da fase
- **THEN** o range é expandido em ±5 pontos de `avg_rating` até encontrar ao menos 1 candidato

#### Scenario: Persistência de avg_rating
- **WHEN** os dados são populados via script offline
- **THEN** `avg_rating` é calculado como média dos ratings dos 11 jogadores de maior rating do squad e persistido no banco — não calculado em runtime

#### Scenario: Progressão no mata-mata
- **WHEN** o usuário vence a fase de grupos (ou avança independente do resultado)
- **THEN** enfrenta adversários nas oitavas, quartas, semi e final em sequência

#### Scenario: Eliminação
- **WHEN** o time do usuário perde no mata-mata
- **THEN** a campanha termina naquela fase e os stats finais são exibidos

---

### Requirement: Simulação de partida com gols por minuto
O sistema SHALL gerar o resultado de cada jogo com gols atribuídos a jogadores específicos e minutos realistas (1–90+).

#### Scenario: Resultado gerado por ratings
- **WHEN** dois times se enfrentam
- **THEN** a probabilidade de gol por time é proporcional ao rating de ataque vs defesa adversária

#### Scenario: Gols atribuídos a jogadores
- **WHEN** um gol é gerado
- **THEN** é atribuído a um jogador do time marcador (favorecendo atacantes/meias), com um minuto entre 1 e 90

#### Scenario: Resultado de empate no mata-mata
- **WHEN** o placar está empatado ao fim dos 90 minutos numa fase eliminatória
- **THEN** o sistema entra na sequência de pênaltis (ver Requirement: Pênaltis como estado de máquina)

---

### Requirement: Pênaltis como estado de máquina

O sistema SHALL modelar a disputa de pênaltis como uma sequência de estados discretos, revelados um a um no modo "jogo a jogo", gerados deterministicamente pelo sub-PRNG `rng_penaltis`.

#### Scenario: Batedores e ordem
- **WHEN** a disputa de pênaltis começa
- **THEN** o sistema seleciona os 5 melhores batedores de cada time (por rating, excluindo GOL) na ordem decrescente de rating

#### Scenario: Probabilidade de conversão
- **WHEN** um pênalti é gerado
- **THEN** a probabilidade de conversão segue: `P = 0.68 + (rating_batedor - 60) * (0.24 / 39)`, resultando em ~68% para rating 60 e ~92% para rating 99
- **AND** se o goleiro adversário tiver rating ≥ 85, `P` é reduzida em `(rating_gol - 84) * 0.004` (máximo -6%)

#### Scenario: Regra de parada antecipada
- **WHEN** um time já conquistou vantagem matematicamente insuperável
- **THEN** a sequência para — não são cobrados pênaltis desnecessários (ex: se está 3-0 após 3 cobranças e o adversário perdeu 2, o jogo termina)

#### Scenario: Estados da máquina de pênaltis
- **WHEN** o modo "jogo a jogo" está ativo durante uma disputa de pênaltis
- **THEN** cada pênalti passa pelos estados: `PENDENTE` ("🟡 BATISTUTA vai bater…") → `REVELADO` ("🟢 CONVERTE" ou "🔴 DEFENDIDO/FORA") com o placar parcial atualizado (`●○○○○ vs ●○○○○`)

#### Scenario: Placar parcial visual
- **WHEN** um pênalti é revelado
- **THEN** o placar de pênaltis é atualizado com símbolos `●` (convertido), `✕` (perdido) e `○` (ainda não cobrado) para cada time, lado a lado

#### Scenario: Sem prorrogação
- **WHEN** o placar está empatado ao fim dos 90 minutos
- **THEN** o jogo vai diretamente para pênaltis, sem 30 minutos de prorrogação — mantém o ritmo do formato arcade

---

### Requirement: Modos de revelação de resultados
O sistema SHALL oferecer dois modos de revelação: jogo a jogo (com suspense) e automático (todos de uma vez).

#### Scenario: Modo jogo a jogo
- **WHEN** o modo "Jogo a jogo" está ativo e o usuário clica em "Revelar"
- **THEN** o sistema exibe o resultado de um jogo por vez, com gols em sequência

#### Scenario: Modo automático
- **WHEN** o usuário seleciona "Automático"
- **THEN** todos os jogos da campanha são revelados imediatamente com placar e gols completos

---

### Requirement: Stats finais da campanha
O sistema SHALL exibir estatísticas consolidadas ao fim da campanha.

#### Scenario: Exibição de stats
- **WHEN** todos os jogos foram revelados
- **THEN** o sistema exibe: fase alcançada, número de vitórias, total de gols pró e gols sofridos

#### Scenario: Botão repetir
- **WHEN** a campanha termina
- **THEN** o sistema oferece "↻ Repetir" para iniciar um novo draft
