# ⚽ WorldCup Pyramid

Jogo diário de ranquear 10 jogadores numa pirâmide por categoria de Copa do Mundo.
Inspirado no [Futbol11 Pyramid](https://futbol11.netlify.app/futbol11-pyramid).

## Como jogar

1. A cada dia, uma nova categoria é revelada (ex: "Gols na Copa do Mundo")
2. 10 jogadores aparecem um por um em ordem aleatória
3. Posicione cada jogador no nível correto da pirâmide
4. O topo (nível 1) = melhor valor, a base (nível 4) = menor valor
5. Compartilhe seu resultado!

```
        [ 1 ]          ← Melhor
      [ 2 ][ 3 ]
   [ 4 ][ 5 ][ 6 ]
 [ 7 ][ 8 ][ 9 ][10]   ← Pior
```

## Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Banco:** Supabase (PostgreSQL)
- **Drag-and-drop:** @dnd-kit/core
- **Dados:** Scripts Python (coleta offline)
- **Deploy:** Vercel

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher valores no .env.local

# 3. Rodar migrations do Supabase
# Copiar supabase/schema.sql e executar no SQL Editor do Supabase

# 4. Coletar dados (uma vez)
pip install requests pandas
python scripts/fetch_openfootball.py
python scripts/build_puzzles.py
python scripts/seed_supabase.py

# 5. Rodar em desenvolvimento
npm run dev
```

## Estrutura de pastas

```
worldcup-pyramid/
├── app/               ← Next.js App Router
├── components/        ← Componentes React
├── lib/               ← Utilitários e clients
├── scripts/           ← Scripts Python de coleta
├── data/              ← JSONs gerados pelos scripts
├── supabase/          ← Schema do banco
├── openspec/          ← Specs do OpenSpec
│   └── specs/         ← Especificações por feature
└── docs/              ← Documentação
    ├── puzzles.md     ← 30 puzzles planejados
    └── data-sources.md
```

## Fontes de dados

| Fonte | O que cobre | Custo |
|---|---|---|
| openfootball/worldcup.json | Copas 1930–2022 | Gratuito |
| FBRef.com | Stats 2014–2022 | Gratuito (scraping) |
| API-Football | Stats modernas | Gratuito (100 req/dia) |
| Wikipedia | Recordes históricos | Gratuito |

## Desenvolvimento com OpenSpec

Este projeto usa [OpenSpec](https://openspec.dev) para spec-driven development.

```bash
# Instalar OpenSpec
npm install -g @fission-ai/openspec@latest

# Inicializar (já feito)
openspec init

# Propor uma nova feature
/opsx:propose "descrição da feature"

# Implementar
/opsx:apply

# Arquivar após concluir
/opsx:archive
```

As specs ficam em `openspec/specs/` e servem como documentação viva do sistema.

## Licença

MIT
