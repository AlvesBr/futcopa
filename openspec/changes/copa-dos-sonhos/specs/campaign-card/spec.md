## ADDED Requirements

### Requirement: Card de campanha compartilhável
O sistema SHALL gerar um card visual da campanha ao fim da simulação, com opção de compartilhar via link ou imagem.

#### Scenario: Exibição do card
- **WHEN** o usuário clica em "Ver meu card →" após a campanha
- **THEN** o sistema exibe um card com: formação visual com jogadores, fase alcançada, placar da campanha, stats (vitórias / gols pró / sofridos)

#### Scenario: Compartilhamento via link
- **WHEN** o usuário clica em compartilhar
- **THEN** o sistema copia para a área de transferência a URL com o SEED da campanha (ex: `futcopa.com/copa-dos-sonhos/simulacao?seed=1YYUVSJ`)

#### Scenario: Texto de compartilhamento
- **WHEN** o link é gerado
- **THEN** inclui um texto pré-formatado (ex: "Cheguei à semi com Batistuta, Messi e R. Carlos! 🏆 Tente você também →")

---

### Requirement: Stats do card
O sistema SHALL incluir no card os jogadores utilizados e os adversários enfrentados.

#### Scenario: Lista de jogadores
- **WHEN** o card é exibido
- **THEN** cada posição da formação mostra: nome do jogador, seleção de origem e edição da Copa

#### Scenario: Percurso da campanha
- **WHEN** o card é exibido
- **THEN** lista os adversários enfrentados por fase com o placar de cada jogo
