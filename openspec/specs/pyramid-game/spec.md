# pyramid-game Specification

## Purpose
Define a mecânica central do jogo: a pirâmide interativa de 4 níveis
onde o usuário posiciona 10 jogadores por drag-and-drop ou clique.

---

## Requirements

### Requirement: Estrutura da pirâmide
O sistema DEVE exibir uma pirâmide visual com 4 níveis e 10 slots totais.

#### Scenario: Layout da pirâmide
- GIVEN o usuário acessa um puzzle
- WHEN a página carrega
- THEN exibir pirâmide com distribuição 1-2-3-4 slots por nível
- AND o nível 1 (topo) representa o maior valor da categoria
- AND o nível 4 (base) representa o menor valor

---

### Requirement: Fila de jogadores
O sistema DEVE apresentar jogadores em fila aleatória para posicionamento.

#### Scenario: Fila inicial
- GIVEN o puzzle foi carregado
- WHEN o jogo inicia
- THEN exibir os 10 jogadores embaralhados em fila
- AND mostrar apenas o primeiro jogador da fila como "ativo"

#### Scenario: Avanço da fila
- GIVEN um jogador foi posicionado num slot
- WHEN o posicionamento é confirmado
- THEN o próximo jogador da fila torna-se ativo
- AND a fila visual avança

---

### Requirement: Posicionamento por drag-and-drop
O sistema DEVE permitir arrastar jogadores da fila para slots da pirâmide.

#### Scenario: Drag válido
- GIVEN o usuário arrasta o jogador ativo
- WHEN solta sobre um slot vazio da pirâmide
- THEN o jogador ocupa aquele slot
- AND o slot fica marcado como preenchido

#### Scenario: Slot já ocupado
- GIVEN o usuário tenta soltar um jogador num slot ocupado
- WHEN a ação é executada
- THEN o jogador retorna à posição original na fila
- AND nenhuma troca ocorre

---

### Requirement: Validação de nível
O sistema DEVE validar se o jogador foi posicionado no nível correto.

#### Scenario: Posicionamento correto
- GIVEN o usuário posiciona um jogador
- WHEN o nível do slot coincide com o nível correto do jogador
- THEN marcar o slot com indicador visual de acerto (verde)
- AND incrementar o contador de acertos

#### Scenario: Posicionamento incorreto
- GIVEN o usuário posiciona um jogador
- WHEN o nível do slot não coincide com o nível correto
- THEN marcar o slot com indicador visual de erro (vermelho)
- AND manter o jogador no slot (não reverter)

---

### Requirement: Modo Fácil
O sistema DEVE oferecer modo fácil que revela o nível correto antes do posicionamento.

#### Scenario: Dica de nível ativo
- GIVEN o modo Fácil está selecionado
- WHEN o jogador ativo é exibido
- THEN mostrar badge indicando o nível correto (ex: "Nível 2")
- AND não revelar o slot exato, apenas o nível

---

### Requirement: Botão HELP
O sistema DEVE oferecer um botão HELP utilizável uma única vez por partida.

#### Scenario: HELP disponível
- GIVEN o usuário ainda não usou o HELP nesta partida
- WHEN clica no botão HELP
- THEN todos os slots corretos são brevemente destacados
- AND o botão HELP é desabilitado pelo restante da partida

#### Scenario: HELP já utilizado
- GIVEN o usuário já usou o HELP
- WHEN visualiza o botão
- THEN o botão exibe estado desabilitado
- AND não permite nova ativação

---

### Requirement: Resultado final
O sistema DEVE exibir tela de resultado ao completar todos os 10 slots.

#### Scenario: Puzzle completado
- GIVEN todos os 10 slots foram preenchidos
- WHEN o último jogador é posicionado
- THEN exibir modal com pontuação (X/10)
- AND mostrar a pirâmide correta completa como referência
- AND oferecer botão de compartilhamento

---

### Requirement: Puzzle diário único
O sistema DEVE garantir que cada puzzle seja jogado apenas uma vez por dia por usuário.

#### Scenario: Replay bloqueado
- GIVEN o usuário já completou o puzzle do dia
- WHEN tenta acessar o mesmo puzzle
- THEN exibir tela de resultado com pontuação anterior
- AND informar que o próximo puzzle estará disponível amanhã

#### Scenario: Persistência local
- GIVEN o usuário completou um puzzle
- WHEN fecha e reabre o navegador
- THEN o resultado anterior é recuperado do localStorage
- AND o replay permanece bloqueado

---

## Níveis da Pirâmide — Mapeamento de Ranks

| Rank | Nível |
|---|---|
| 1 | 1 |
| 2, 3 | 2 |
| 4, 5, 6 | 3 |
| 7, 8, 9, 10 | 4 |
