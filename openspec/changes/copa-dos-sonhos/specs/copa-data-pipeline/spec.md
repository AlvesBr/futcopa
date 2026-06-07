## ADDED Requirements

### Requirement: Coleta offline de elencos históricos
O sistema SHALL coletar elencos de Copas do Mundo 1966–2022 via scripts Python executados offline, gerando dados para popular o Supabase.

#### Scenario: Execução do script de coleta
- **WHEN** o script `fetch_cup_squads.py` é executado
- **THEN** gera JSONs com elencos por seleção e edição de Copa, incluindo número, nome, posição(ões) e fonte dos dados

#### Scenario: Cobertura mínima
- **WHEN** a coleta é concluída
- **THEN** existem dados para pelo menos 15 edições de Copa (1966–2022) com no mínimo 8 seleções por edição

---

### Requirement: Geração de ratings
O sistema SHALL calcular ratings 60–99 para cada jogador por campanha, via script offline.

#### Scenario: Execução do build_ratings
- **WHEN** o script `build_ratings.py` é executado sobre os JSONs coletados
- **THEN** cada jogador recebe um rating numérico entre 60 e 99 baseado em participações, gols e relevância histórica

#### Scenario: Rating obrigatoriamente por edição
- **WHEN** o mesmo jogador aparece em múltiplas Copas (ex: Messi em 2006, 2010, 2014, 2018 e 2022)
- **THEN** cada aparição gera um `cup_player` separado com rating independente — não existe "rating de carreira" no sistema; o rating é sempre da performance naquela Copa específica
- **AND** Messi 2006 (19 anos, fase de grupos) PODE ter rating diferente de Messi 2022 (Copa conquistada)

---

### Requirement: Schema de banco — tabelas Copa dos Sonhos
O sistema SHALL ter 3 novas tabelas no Supabase: `cup_editions`, `cup_squads` e `cup_players`.

#### Scenario: Estrutura cup_editions
- **WHEN** a migração é aplicada
- **THEN** a tabela `cup_editions` contém: id, year (int), host_country (text), champion (text)

#### Scenario: Estrutura cup_squads
- **WHEN** a migração é aplicada
- **THEN** a tabela `cup_squads` contém: id, edition_id (FK), country_code (text), country_name (text), flag_emoji (text), avg_rating (int) — média dos ratings dos 11 titulares estimados, persistida offline para uso no pool de adversários por fase

#### Scenario: Estrutura cup_players
- **WHEN** a migração é aplicada
- **THEN** a tabela `cup_players` contém: id, squad_id (FK), squad_number (int), name (text), positions (text[]), rating (int 60–99), photo_url (text nullable)

---

### Requirement: Seed script de população
O sistema SHALL incluir script para popular o Supabase com os dados coletados.

#### Scenario: Execução do seed
- **WHEN** o script `seed_copa_supabase.py` é executado com SERVICE_ROLE_KEY válida
- **THEN** as tabelas `cup_editions`, `cup_squads` e `cup_players` são populadas via upsert sem duplicatas
