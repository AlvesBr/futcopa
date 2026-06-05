# data-pipeline Specification

## Purpose
Definir o processo de coleta, transformação e carga dos dados
que alimentam os puzzles. Toda coleta é offline e assíncrona
ao runtime do jogo.

---

## Requirements

### Requirement: Coleta offline obrigatória
O sistema NUNCA DEVE chamar APIs externas durante o runtime do jogo.

#### Scenario: Dados servidos do Supabase
- GIVEN um usuário acessa um puzzle
- WHEN os dados são carregados
- THEN vir exclusivamente do Supabase ou do arquivo data/puzzles.json
- AND nenhuma request externa é feita pelo frontend

---

### Requirement: Script de coleta openfootball
O sistema DEVE baixar e processar todos os worldcup.json disponíveis.

#### Scenario: Execução bem-sucedida
- GIVEN o script fetch_openfootball.py é executado
- WHEN completa sem erros
- THEN gerar arquivos em data/raw/worldcup_{ano}.json para cada copa
- AND logar número de jogos e gols processados por copa

#### Scenario: Copa sem dados detalhados
- GIVEN a copa de 1930 não tem dados de gols por jogador
- WHEN o script processa esse arquivo
- THEN salvar o placar disponível sem quebrar
- AND registrar warning no log

---

### Requirement: Script de coleta FBRef
O sistema DEVE fazer scraping das tabelas de estatísticas do FBRef.

#### Scenario: Rate limiting respeitado
- GIVEN o script fetch_fbref.py é executado
- WHEN faz requisições ao FBRef
- THEN aguardar mínimo 3 segundos entre cada request
- AND nunca fazer mais de 20 requests por sessão

#### Scenario: Tabela não encontrada
- GIVEN uma URL do FBRef retorna erro ou tabela vazia
- WHEN o script tenta parsear
- THEN registrar erro no log e continuar para a próxima URL
- AND não interromper a execução

---

### Requirement: Script de coleta API-Football
O sistema DEVE respeitar o limite de 100 requests/dia do plano gratuito.

#### Scenario: Verificação de cota antes de rodar
- GIVEN o script fetch_api_football.py inicia
- WHEN chama o endpoint /status
- THEN verificar requests_remaining do dia
- AND se < 20, exibir aviso e aguardar confirmação do usuário

#### Scenario: Dados salvos localmente
- GIVEN uma resposta válida da API é recebida
- WHEN os dados são processados
- THEN salvar em data/raw/apifootball_{endpoint}_{params}.json
- AND nunca refazer uma chamada se o arquivo local já existir

---

### Requirement: Script build_puzzles.py
O sistema DEVE gerar o arquivo data/puzzles.json a partir dos dados brutos.

#### Scenario: Cálculo de correct_level
- GIVEN um puzzle com 10 jogadores ordenados por value
- WHEN build_puzzles.py processa o puzzle
- THEN calcular correct_level automaticamente:
  - rank 1 → level 1
  - ranks 2–3 → level 2
  - ranks 4–6 → level 3
  - ranks 7–10 → level 4

#### Scenario: Validação de dados
- GIVEN um puzzle está sendo construído
- WHEN o script verifica os dados
- THEN garantir que todos os 10 players têm photo_url válida
- AND garantir que os values são únicos (sem empates) ou documentados
- AND garantir que a data não conflita com puzzle existente

---

### Requirement: Seed no Supabase
O sistema DEVE popular o Supabase a partir dos JSONs locais.

#### Scenario: Inserção idempotente
- GIVEN o script seed_supabase.py é executado
- WHEN um puzzle com aquela data já existe no banco
- THEN usar UPSERT (inserir se não existe, atualizar se existe)
- AND não duplicar registros

#### Scenario: Falha de rede
- GIVEN o Supabase está indisponível durante o seed
- WHEN o script tenta inserir
- THEN registrar erro e continuar para o próximo puzzle
- AND ao final, listar todos os puzzles que falharam

---

## Estrutura de arquivos gerados

```
data/
├── raw/
│   ├── worldcup_1930.json
│   ├── worldcup_1934.json
│   ├── ...
│   ├── worldcup_2022.json
│   ├── fbref_2022_stats.csv
│   ├── fbref_2018_stats.csv
│   ├── apifootball_topscorers_2022.json
│   └── apifootball_fixtures_2022.json
├── players.json          ← consolidado de todos os jogadores
└── puzzles.json          ← 30 puzzles prontos para seed
```
