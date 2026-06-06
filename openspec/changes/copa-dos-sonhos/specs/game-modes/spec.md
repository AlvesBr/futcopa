## ADDED Requirements

### Requirement: Copa dos Sonhos como modo de jogo independente
O sistema SHALL disponibilizar Copa dos Sonhos como um modo de jogo distinto, acessível a partir da home, sem interferir com o puzzle diário (Pyramid).

#### Scenario: Acesso à Copa dos Sonhos
- **WHEN** o usuário acessa a home do produto
- **THEN** a Copa dos Sonhos é exibida como opção de jogo separada do puzzle diário

#### Scenario: Isolamento de estado
- **WHEN** o usuário joga Copa dos Sonhos
- **THEN** o progresso do puzzle diário (Pyramid) não é afetado e vice-versa

#### Scenario: Rejogabilidade ilimitada
- **WHEN** o usuário termina uma campanha na Copa dos Sonhos
- **THEN** pode iniciar uma nova campanha imediatamente, sem bloqueio por data (diferente do Pyramid)

---

### Requirement: Home como hub escalável de modos

O sistema SHALL refatorar `app/page.tsx` de redirect automático para uma hub page que apresenta todos os modos disponíveis, escalando para N modos futuros.

#### Scenario: Layout hero + secondary grid
- **WHEN** o usuário acessa a raiz do site (`/`)
- **THEN** a home exibe o Pyramid como bloco hero (destaque principal, com preview do puzzle do dia) e os demais modos num grid secundário abaixo

#### Scenario: Registro de modos via `lib/gameModes.ts`
- **WHEN** um novo modo de jogo é adicionado ao produto
- **THEN** basta adicionar uma entrada no array exportado por `lib/gameModes.ts` — a home itera sobre esse array para renderizar os cards secundários, sem mudanças no componente de layout

#### Scenario: Interface de um modo registrado
- **WHEN** um modo é registrado em `lib/gameModes.ts`
- **THEN** deve conter: `id`, `title`, `description`, `href`, `duration` (ex: "~10 min"), `available` (boolean) e `badge` opcional ("NOVO" | "EM BREVE")

#### Scenario: Modo indisponível
- **WHEN** `available: false` para um modo
- **THEN** o card é exibido com badge "EM BREVE" e sem link clicável — útil para anunciar modos futuros
