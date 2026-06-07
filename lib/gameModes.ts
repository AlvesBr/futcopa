/**
 * Registro de modos de jogo do FutCopa.
 * A home itera sobre este array para renderizar os cards secundários (D9).
 * Adicionar um modo = adicionar uma entrada aqui.
 */

import type { HubMode } from '@/lib/types'

export const GAME_MODES: HubMode[] = [
  {
    id:          'copa-dos-sonhos',
    title:       'Copa dos Sonhos',
    description: 'Monte seu dream team com craques históricos de todas as Copas e simule o torneio.',
    href:        '/copa-dos-sonhos',
    duration:    '~10 min',
    available:   true,
    badge:       'NOVO',
  },
  // Próximos modos podem ser adicionados aqui com available: false
  // {
  //   id:          'quem-sou-eu',
  //   title:       'Quem Sou Eu?',
  //   description: 'Adivinhe o jogador pelas dicas.',
  //   href:        '/quem-sou-eu',
  //   duration:    '~3 min',
  //   available:   false,
  //   badge:       'EM BREVE',
  // },
]
