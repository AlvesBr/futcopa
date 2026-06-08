# Como expandir os elencos — guia completo

## Situação atual
- **30 squads** no banco: campeões + vice-campeões de cada Copa 1970–2022  
- Cada squad tem 11 jogadores com ratings manuais

## Potencial máximo
| Escopo | Squads | Jogadores |
|--------|--------|-----------|
| Top 4 por Copa (atual +8)  | ~52  | ~572  |
| Top 8 por Copa (semi)      | ~104 | ~1.144 |
| Todos os grupos (16/24/32) | ~350 | ~3.850 |

---

## Fontes por ordem de qualidade

| Fonte | Copas cobertas | Dados | Limite |
|-------|----------------|-------|--------|
| **Wikipedia** | 1930–2022 | Elencos completos 23 jogadores, posição, caps, gols carreira | Nenhum — gratuito |
| **FBRef** | 2006–2022 | Stats do torneio: gols, assists, minutos, xG | ~30 req/hora |
| **openfootball JSON** | 1930–2022 | Fixtures, gols (por jogo), não tem elencos | Nenhum |
| **API-Football** | 2006–2026 | Stats completas | 100 req/dia (free) |

**Estratégia recomendada:** Wikipedia (base) + FBRef (enriquecimento para 2006+).

---

## Pipeline automatizado

### 1. Instalar dependências
```bash
pip install pandas requests lxml python-dotenv supabase
```

### 2. Coletar todos os elencos — Wikipedia + FBRef
```bash
# Todas as Copas 1970–2022 (~40 min por causa do rate-limit FBRef)
python scripts/fetch_all_wc_squads.py

# Só algumas Copas (mais rápido)
python scripts/fetch_all_wc_squads.py --years 2014 2018 2022

# Sem FBRef (só Wikipedia, ~5 min)
python scripts/fetch_all_wc_squads.py --no-fbref

# Gerar SQL direto (sem JSON intermediário)
python scripts/fetch_all_wc_squads.py --gen-sql
```

Resultado: `data/all_wc_squads.json` com até ~350 seleções.

### 3. Calcular ratings
```bash
python scripts/build_ratings.py
```
Resultado: `data/cup_players_rated.json` com ratings 65–99.

### 4. Push para Supabase (idempotente)
```bash
# Via script Python (usa upsert — pode re-executar sem duplicatas)
python scripts/seed_copa_supabase.py

# Ou via SQL gerado
npx supabase db query --linked --file data/all_wc_squads.sql
```

---

## Como o script calcula ratings

```
rating = base_pos + bônus_caps + bônus_gols_carreira + bônus_torneio + bônus_minutos
```

| Componente | Valor |
|-----------|-------|
| Base GOL | 73 |
| Base ZAG | 72 |
| Base MEI | 73 |
| Base CA | 75 |
| Caps internacionais | +1 a cada 15 caps, máx +12 |
| Gols na carreira (atac/meio) | +1 a cada 8 gols, máx +8 |
| Gols + assists no torneio | +2×gols + assists, máx +6 |
| Minutos jogados (≥450) | +3 |

**Overrides para lendas** já incluídos no script (Pelé 99, Maradona 97-99, Zidane 96, Messi 97-99, Ronaldo 93-97, Beckenbauer 92-98, etc.)

---

## Filtrar apenas os melhores squads

Para não inserir seleções fracas (avg_rating < 78), edite `seed_copa_supabase.py`:

```python
# Filtrar squads mínimos
if squad["avg_rating"] < 78:
    continue
# ou: só incluir os top N por Copa
```

Ou filtre no SQL depois:
```sql
DELETE FROM cup_squads WHERE avg_rating < 76;
```

---

## Verificar o que foi inserido

```bash
echo "SELECT ce.year, cs.country_name, cs.phase_reached, cs.avg_rating, COUNT(cp.id) players
FROM cup_squads cs
JOIN cup_editions ce ON cs.edition_id = ce.id
LEFT JOIN cup_players cp ON cp.squad_id = cs.id
GROUP BY ce.year, cs.country_name, cs.phase_reached, cs.avg_rating
ORDER BY ce.year, cs.avg_rating DESC" > /tmp/check.sql

npx supabase db query --linked --file /tmp/check.sql
```

---

## Troubleshooting

**Wikipedia mudou o layout?**  
O script usa `pd.read_html` + regex de cabeçalhos H2/H3. Se falhar numa Copa específica:
```bash
python scripts/fetch_all_wc_squads.py --years 1982 --no-fbref
# checar data/all_wc_squads.json para ver o que foi capturado
```

**FBRef bloqueou (429)?**  
Aumente o delay:
```bash
python scripts/fetch_all_wc_squads.py --delay 10
```

**Jogador tem rating errado?**  
Adicione um override em `RATING_OVERRIDES` no script:
```python
"nome_sem_acento|ano": 95,  # ex: "lineker|1986": 88
```

---

## Quantos squads o jogo precisa?

Para boa variedade no draft e simulação sem repetição:

| Squads | Experiência |
|--------|------------|
| 14 (atual) | Repetição frequente, jogabilidade limitada |
| 30 (agora) | Boa variedade por Copa, algumas repetições |
| 60–80 | Ótimo — cada Copa tem 4-6 opções |
| 100+ | Excelente — praticamente sem repetição |

**Recomendação:** rodar o script e inserir os **top 6-8 squads por Copa** (avg_rating ≥ 78).  
Isso dará ~100 squads com ~1.100 jogadores — diversidade excelente.
