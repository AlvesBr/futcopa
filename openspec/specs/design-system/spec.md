## Purpose

Fundação visual do produto: tokens versionados (claro/escuro), scaffold Next.js + Tailwind + Storybook,
biblioteca de primitivos (`components/ui/*`) documentada e regras de acessibilidade de feedback.

## Requirements

### Requirement: Tokens de design versionados
O sistema SHALL definir os tokens visuais (cores, tipografia, espaçamento, raios, sombras e
motion) num único lugar versionado, consumidos por toda a UI via Tailwind e CSS variables.

#### Scenario: Token único como fonte de verdade
- **WHEN** um componente precisa de uma cor, espaçamento ou raio
- **THEN** ele referencia um token do tema (classe Tailwind ou CSS var)
- **AND** não usa valores hardcoded fora do conjunto de tokens

### Requirement: Temas claro e escuro
O sistema SHALL suportar tema claro e escuro, respeitando a preferência do sistema operacional,
permitindo override manual persistido e sem flash de tema incorreto no carregamento.

#### Scenario: Preferência do sistema
- **WHEN** o usuário abre o app pela primeira vez
- **THEN** o tema inicial segue `prefers-color-scheme`

#### Scenario: Override manual persistido
- **WHEN** o usuário alterna o tema pelo toggle
- **THEN** a escolha é aplicada imediatamente
- **AND** persiste entre recarregamentos (localStorage)

### Requirement: Biblioteca de primitivos documentada
O sistema SHALL fornecer componentes primitivos reutilizáveis (Button, Card, Modal, Badge,
Avatar, Slot, Toast, IconButton) documentados no Storybook, cada um com suas variações em ambos
os temas.

#### Scenario: Primitivo visível no Storybook
- **WHEN** o Storybook é iniciado
- **THEN** cada primitivo aparece com suas variações
- **AND** pode ser visualizado em tema claro e escuro

### Requirement: Feedback acessível
O sistema SHALL garantir contraste mínimo WCAG AA e SHALL representar estados de acerto/erro com
mais do que cor (ícone e/ou forma), de modo a permanecer legível para usuários daltônicos.

#### Scenario: Estado de acerto/erro distinguível sem cor
- **WHEN** um estado de acerto ou erro é exibido
- **THEN** ele inclui um indicador não-cromático (ícone ou forma)
- **AND** o contraste de texto/fundo atende WCAG AA

### Requirement: Fundação mobile-first
O sistema SHALL definir breakpoints e layouts partindo do mobile, garantindo que os primitivos
funcionem em telas pequenas antes de escalarem para desktop.

#### Scenario: Primitivos em viewport mobile
- **WHEN** um primitivo é renderizado numa largura de ~360px
- **THEN** ele permanece utilizável e legível sem overflow horizontal
