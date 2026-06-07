# game-modes Specification

## Purpose
Definir os modos de jogo disponíveis (Fácil e Normal) e
o comportamento do sistema de dica (HELP).

---

## Requirements

### Requirement: Seleção de modo antes de jogar
O sistema DEVE permitir que o usuário escolha o modo antes de iniciar.

#### Scenario: Tela de seleção
- GIVEN o usuário acessa um puzzle não jogado
- WHEN a página carrega
- THEN exibir seleção de modo antes de mostrar a fila de jogadores
- AND modo Normal selecionado por padrão

#### Scenario: Persistência do modo
- GIVEN o usuário escolheu Modo Fácil
- WHEN fecha e reabre o jogo no mesmo dia
- THEN manter modo Fácil selecionado (via localStorage)

---

### Requirement: Modo Normal
O sistema DEVE, no modo Normal, não revelar o nível correto dos jogadores.

#### Scenario: Ausência de dicas de nível
- GIVEN modo Normal está ativo
- WHEN o jogador ativo é exibido
- THEN mostrar apenas: nome, foto, país
- AND não revelar o nível correto na interface

---

### Requirement: Modo Fácil
O sistema DEVE, no modo Fácil, revelar o nível correto de cada jogador.

#### Scenario: Badge de nível visível
- GIVEN modo Fácil está ativo
- WHEN o jogador ativo é exibido
- THEN mostrar badge: "📍 Nível 2" (nível correto na pirâmide)
- AND não revelar o slot específico dentro do nível

#### Scenario: Indicação nos slots ao arrastar
- GIVEN modo Fácil está ativo e usuário está arrastando
- WHEN o card está sobre slots de nível correto
- THEN destacar os slots do nível correto em verde suave
- AND slots de nível incorreto em tom neutro

---

### Requirement: Botão HELP
O sistema DEVE oferecer hint único por partida.

#### Scenario: Ativação do HELP
- GIVEN o botão HELP está disponível (não usado)
- WHEN o usuário clica
- THEN exibir modal de confirmação: "Usar dica? (1x por partida)"
- AND após confirmar: destacar todos os slots preenchidos corretamente
- AND desabilitar o botão permanentemente nesta partida

#### Scenario: Destaque visual do HELP
- GIVEN o HELP foi ativado
- WHEN o destaque é mostrado
- THEN slots corretos piscam em verde por 2 segundos
- AND slots incorretos piscam em vermelho por 2 segundos
- AND o estado retorna ao normal após a animação

#### Scenario: HELP e pontuação
- GIVEN o usuário usou o HELP
- WHEN o resultado final é exibido
- THEN mostrar "(com dica)" ao lado da pontuação
- AND o texto de compartilhamento inclui "com dica 💡"

---

## Modos e Pontuação

| Modo | HELP usado | Pontuação máxima |
|---|---|---|
| Normal | Não | 10/10 ⭐ |
| Normal | Sim | 10/10 💡 |
| Fácil | Não | 10/10 (Fácil) |
| Fácil | Sim | 10/10 (Fácil 💡) |
