# daily-puzzle Specification

## Purpose
Gerenciar a lógica de seleção, entrega e rotação do puzzle diário,
garantindo que cada data tenha exatamente um puzzle e que o usuário
só possa jogar uma vez por dia.

---

## Requirements

### Requirement: Puzzle único por data
O sistema DEVE associar exatamente um puzzle a cada data do calendário.

#### Scenario: Acesso pelo puzzle do dia
- GIVEN existe um puzzle com a data de hoje no banco
- WHEN o usuário acessa a rota raiz "/"
- THEN redirecionar para "/play/YYYY-MM-DD" com a data atual
- AND carregar os dados do puzzle correspondente

#### Scenario: Data sem puzzle cadastrado
- GIVEN não existe puzzle para a data atual
- WHEN o usuário acessa "/"
- THEN exibir mensagem "Puzzle indisponível — volte amanhã"

---

### Requirement: Acesso por URL com data
O sistema DEVE permitir acesso direto a qualquer puzzle via URL.

#### Scenario: URL de puzzle passado
- GIVEN o usuário acessa "/play/2024-06-01"
- WHEN o puzzle existe no banco
- THEN exibir o puzzle normalmente
- AND verificar localStorage para replay

#### Scenario: URL de puzzle futuro
- GIVEN o usuário acessa "/play/2099-01-01"
- WHEN não existe puzzle para essa data
- THEN exibir página 404 customizada

---

### Requirement: Bloqueio de replay
O sistema DEVE impedir que o usuário jogue o mesmo puzzle mais de uma vez.

#### Scenario: Verificação no carregamento
- GIVEN o usuário acessa um puzzle
- WHEN o componente carrega
- THEN verificar localStorage pela chave "puzzle_result_YYYY-MM-DD"
- AND se existir, exibir tela de resultado em vez do jogo

#### Scenario: Salvar resultado
- GIVEN o usuário completou um puzzle
- WHEN a última peça é posicionada
- THEN salvar em localStorage: { score, usedHelp, completedAt }
- AND a chave é "puzzle_result_YYYY-MM-DD"

---

### Requirement: Compartilhamento do resultado
O sistema DEVE gerar texto de compartilhamento ao estilo Wordle.

#### Scenario: Texto gerado
- GIVEN o puzzle foi completado com score 7/10
- WHEN o usuário clica em "Compartilhar"
- THEN copiar para clipboard:
  ```
  ⚽ WorldCup Pyramid — 04/06/2024
  🏆 Gols na Copa do Mundo
  
  🟩⬜
  🟩🟥
  🟩🟩🟥
  🟥🟩🟩🟩
  
  7/10 acertos
  ```
- AND exibir toast de confirmação "Copiado!"

---

### Requirement: Contador regressivo
O sistema DEVE exibir tempo até o próximo puzzle após completar.

#### Scenario: Countdown ativo
- GIVEN o usuário está na tela de resultado
- WHEN o componente monta
- THEN calcular tempo até meia-noite do próximo dia
- AND exibir contador no formato HH:MM:SS
- AND atualizar a cada segundo

---

## Estrutura no localStorage

```
Chave: "puzzle_result_2024-06-04"
Valor: {
  "score": 7,
  "usedHelp": false,
  "timeSpent": 234,
  "completedAt": "2024-06-04T20:14:33.000Z",
  "slots": [
    { "rank": 1, "correct": true },
    { "rank": 2, "correct": true },
    ...
  ]
}
```
