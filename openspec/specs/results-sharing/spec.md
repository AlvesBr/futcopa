# results-sharing Specification

## Purpose
Definir como o resultado do puzzle é apresentado e como o usuário
pode compartilhá-lo em redes sociais, similar ao Wordle.

---

## Requirements

### Requirement: Modal de resultado
O sistema DEVE exibir modal de resultado ao completar o puzzle.

#### Scenario: Exibição imediata
- GIVEN o último slot foi preenchido
- WHEN a validação final é executada
- THEN exibir modal após 800ms (dar tempo para animação)
- AND mostrar pontuação em destaque (ex: "7 / 10")
- AND mostrar pirâmide resumida com cores de acerto/erro

---

### Requirement: Texto de compartilhamento
O sistema DEVE gerar texto copiável para redes sociais.

#### Scenario: Formato gerado
- GIVEN score = 7, usedHelp = false, category = "Gols na Copa"
- WHEN o usuário clica em "Compartilhar resultado"
- THEN gerar e copiar para clipboard:

```
⚽ WorldCup Pyramid #1
🏆 Gols na Copa do Mundo

🟩
🟩🟩
🟩🟥🟩
🟥🟩🟩🟩

7/10 — sem dica
worldcup-pyramid.vercel.app
```

#### Scenario: Legenda dos emojis
- 🟩 = acertou o nível
- 🟥 = errou o nível
- Linha 1 = nível 1 (1 slot)
- Linha 2 = nível 2 (2 slots)
- Linha 3 = nível 3 (3 slots)
- Linha 4 = nível 4 (4 slots)

---

### Requirement: Estatísticas da comunidade
O sistema DEVE exibir estatísticas agregadas de todos os jogadores.

#### Scenario: Stats após completar
- GIVEN o puzzle foi completado
- WHEN o modal de resultado abre
- THEN buscar do Supabase (view puzzle_stats):
  - Total de jogadas hoje
  - Pontuação média
  - % que acertou tudo (10/10)
- AND exibir essas informações no modal

---

### Requirement: OG Tags para compartilhamento
O sistema DEVE gerar Open Graph tags dinâmicas para cada puzzle.

#### Scenario: Preview ao compartilhar link
- GIVEN o usuário compartilha "worldcup-pyramid.com/play/2024-06-04"
- WHEN o link é aberto no WhatsApp/Twitter/etc
- THEN exibir preview com:
  - Título: "WorldCup Pyramid — Gols na Copa do Mundo"
  - Descrição: "Você consegue ordenar os 10 maiores artilheiros?"
  - Imagem: og-image gerada com a pirâmide do dia
