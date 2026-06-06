## ADDED Requirements

### Requirement: Seleção de formação e modo
O sistema SHALL permitir que o usuário escolha uma formação tática (entre 8 opções) e um modo de dificuldade antes de iniciar o draft.

#### Scenario: Escolha de formação
- **WHEN** o usuário acessa a página Copa dos Sonhos
- **THEN** o sistema exibe os 8 esquemas táticos (4-3-3, 4-4-2, 4-2-3-1, 4-2-4, 3-5-2, 5-3-2, 4-5-1, 3-4-3) como botões selecionáveis

#### Scenario: Escolha de modo de dificuldade
- **WHEN** o usuário seleciona uma formação
- **THEN** o sistema exibe os modos Clássico e Almanaque como opções mutuamente exclusivas antes de iniciar

---

### Requirement: Roll de seleção e Copa
O sistema SHALL sortear aleatoriamente uma seleção nacional e uma edição da Copa do Mundo a cada pick do draft.

#### Scenario: Roll inicial
- **WHEN** o usuário clica em "Rolar" e há slots vazios na formação
- **THEN** o sistema exibe: bandeira + nome da seleção, ano da Copa, e o elenco completo daquela campanha

#### Scenario: Elenco exibido com dados completos
- **WHEN** um roll é realizado
- **THEN** cada jogador do elenco é exibido com número, nome, posição(ões) e rating (se modo Clássico) ou só posição (se modo Almanaque)

---

### Requirement: Re-sorteio por pick
O sistema SHALL permitir ao usuário re-sortear a seleção ou a Copa de forma independente, com até 3 re-sorteios por pick.

#### Scenario: Re-sortear seleção
- **WHEN** o usuário clica em "↺ Outra Seleção"
- **THEN** o sistema mantém a edição da Copa e sorteia nova seleção, decrementando o contador de re-sorteios

#### Scenario: Re-sortear Copa
- **WHEN** o usuário clica em "↺ Outra Copa"
- **THEN** o sistema mantém a seleção e sorteia nova edição da Copa, decrementando o contador de re-sorteios

#### Scenario: Limite de re-sorteios atingido
- **WHEN** o contador de re-sorteios chega a 0
- **THEN** os botões de re-sorteio são desabilitados para o pick atual

---

### Requirement: Seleção e atribuição de jogador
O sistema SHALL permitir que o usuário selecione um jogador do elenco e o atribua ao slot compatível na formação visual.

#### Scenario: Seleção de jogador
- **WHEN** o usuário clica em um jogador do elenco
- **THEN** o jogador é marcado como selecionado e os slots compatíveis com suas posições ficam destacados na formação

#### Scenario: Atribuição ao slot
- **WHEN** o usuário clica em um slot compatível após selecionar um jogador
- **THEN** o jogador é atribuído àquele slot e o contador de picks avança (ex: "2/11")

#### Scenario: Incompatibilidade de posição
- **WHEN** o usuário seleciona um jogador cuja posição não é compatível com nenhum slot vazio
- **THEN** nenhum slot fica destacado, o jogador não pode ser atribuído, e o sistema exibe mensagem explicando quais posições o jogador ocupa e por que não há slot disponível (ex: "Verón joga MEI — todos os slots de meio-campo estão preenchidos")

---

### Requirement: Mapa de compatibilidade de posições

O sistema SHALL usar um mapa fixo de compatibilidade entre as posições dos jogadores e os tipos de slot da formação, permitindo que jogadores multi-posição se encaixem em slots alternativos.

#### Scenario: Compatibilidade direta
- **WHEN** a posição primária do jogador coincide com o tipo do slot vazio
- **THEN** o slot é destacado como compatível

#### Scenario: Compatibilidade por equivalência
- **WHEN** o jogador tem posição secundária mapeada para um slot vazio
- **THEN** o slot também é destacado como compatível, segundo o mapa:
  - `MD` (meia-direita) → compatível com `MEI` e `PD`
  - `ME` (meia-esquerda) → compatível com `MEI` e `PE`
  - `PD` (ponta-direita) → compatível com `PD` e `CA`
  - `PE` (ponta-esquerda) → compatível com `PE` e `CA`
  - `CA` (centroavante) → compatível com `CA`, `PE` e `PD`
  - `ZAG` → compatível com `ZAG` apenas
  - `LD` → compatível com `LD` apenas
  - `LE` → compatível com `LE` apenas
  - `GOL` → compatível com `GOL` apenas
  - `MEI` → compatível com `MEI` apenas

#### Scenario: Múltiplos slots compatíveis
- **WHEN** o jogador tem compatibilidade com mais de um slot vazio na formação
- **THEN** todos os slots compatíveis ficam destacados simultaneamente e o usuário escolhe em qual alocar

#### Scenario: Posição não reconhecida
- **WHEN** o banco retorna uma sigla de posição não presente no mapa de compatibilidade
- **THEN** o sistema trata como incompatível com todos os slots (não quebra) e registra aviso no console para correção do dado

---

### Requirement: Box score em tempo real
O sistema SHALL exibir ratings compostos de ataque e defesa do time em formação, atualizados a cada pick.

#### Scenario: Atualização do box score
- **WHEN** um jogador é atribuído a um slot
- **THEN** o box score atualiza os valores de ATAQUE e DEFESA com base nos ratings dos jogadores já alocados

#### Scenario: Exibição por posição
- **WHEN** o box score está visível
- **THEN** cada linha exibe: posição, nome do jogador atribuído e seu rating individual (ou "—" se vazio)

---

### Requirement: Conclusão do draft
O sistema SHALL detectar quando todos os 11 slots estão preenchidos e oferecer a opção de simular.

#### Scenario: Time completo
- **WHEN** o 11º jogador é atribuído
- **THEN** o sistema exibe o botão "Simular a Copa →" e a mensagem "Escalação completa 11/11"

#### Scenario: Navegação para simulação
- **WHEN** o usuário clica em "Simular a Copa →"
- **THEN** o sistema navega para a página de simulação, passando o estado do time e gerando um SEED único
