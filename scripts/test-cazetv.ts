/* Teste manual do matching CazéTV — rodar com: npx tsx scripts/test-cazetv.ts */
import { findMatchVideo, cazeLinkFor, type CazeVideo } from '../lib/cazetv'
import type { RawMatch } from '../lib/live'

const videos: CazeVideo[] = [
  { videoId: 'AaYn0OlXt10', title: 'AO VIVO: SUPER ESQUENTA CANADÁ X BÓSNIA! HOJE TEM PAÍS DOIS PAÍSES SEDES ESTREANDO | AQUI É BRASIL', published: '2026-06-11T23:34:28+00:00' },
  { videoId: 'ietX3IS_P10', title: '2º DIA DE COPA! HOJE TEM CANADÁ X BÓSNIA E ESTADOS UNIDOS X PARAGUAI | GERAL CAZÉTV 12/06', published: '2026-06-11T20:45:42+00:00' },
  { videoId: 'LjEP9frJ2CE', title: 'JOGO COMPLETO: COREIA DO SUL X TCHÉQUIA | COPA DO MUNDO FIFA™ 2026 | 1ª RODADA | FASE DE GRUPOS', published: '2026-06-12T08:35:30+00:00' },
  { videoId: 'LIVE_MATCH', title: 'CANADÁ X BÓSNIA E HERZEGOVINA | COPA DO MUNDO FIFA 2026 | FASE DE GRUPOS | AO VIVO', published: '2026-06-12T18:00:00+00:00' },
]

const canada: RawMatch = { round: 'Matchday 2', date: '2026-06-12', time: '15:00 UTC-4', team1: 'Canada', team2: 'Bosnia & Herzegovina', group: 'Group B' }
const korea: RawMatch = { round: 'Matchday 1', date: '2026-06-11', time: '20:00 UTC-6', team1: 'South Korea', team2: 'Czech Republic', group: 'Group A', score: { ft: [2, 1] } }
const mexico: RawMatch = { round: 'Matchday 1', date: '2026-06-11', time: '13:00 UTC-6', team1: 'Mexico', team2: 'South Africa', group: 'Group A', score: { ft: [2, 0] } }
const knockout: RawMatch = { round: 'Round of 32', date: '2026-06-28', time: '12:00 UTC-4', team1: 'W73', team2: 'W74' }

console.log('canada AO VIVO            →', JSON.stringify(findMatchVideo(canada, videos, 'live')))
console.log('canada upcoming sem live  →', JSON.stringify(findMatchVideo(canada, videos.slice(0, 3), 'upcoming')))
console.log('korea finished            →', JSON.stringify(findMatchVideo(korea, videos, 'finished')))
console.log('mexico finished sem video →', JSON.stringify(findMatchVideo(mexico, videos, 'finished')))
console.log('knockout placeholder      →', JSON.stringify(findMatchVideo(knockout, videos, 'upcoming')))
console.log('canada live feed vazio    →', JSON.stringify(cazeLinkFor(canada, [], 'live')))
