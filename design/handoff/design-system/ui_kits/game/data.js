/* FutCopa game — illustrative data for the UI kit (not authoritative stats). */
window.FC_DATA = {
  puzzleNo: 128,
  category: { label: "Mais gols em Copas", desc: "Artilheiros na história da Copa do Mundo", unit: "gols" },
  // Ordered #1 (highest) → #10 (lowest). rank = correct pyramid position.
  players: [
    { id: "klose",  name: "Klose",     country: "Alemanha",  flag: "🇩🇪", value: 16 },
    { id: "ronaldo",name: "Ronaldo",   country: "Brasil",    flag: "🇧🇷", value: 15 },
    { id: "muller", name: "G. Müller", country: "Alemanha",  flag: "🇩🇪", value: 14 },
    { id: "fontaine",name: "Fontaine", country: "França",    flag: "🇫🇷", value: 13 },
    { id: "pele",   name: "Pelé",      country: "Brasil",    flag: "🇧🇷", value: 12 },
    { id: "kocsis", name: "Kocsis",    country: "Hungria",   flag: "🇭🇺", value: 11 },
    { id: "lineker",name: "Lineker",   country: "Inglaterra",flag: "🇬🇧", value: 10 },
    { id: "rivaldo",name: "Rivaldo",   country: "Brasil",    flag: "🇧🇷", value: 9  },
    { id: "bati",   name: "Batistuta", country: "Argentina", flag: "🇦🇷", value: 8  },
    { id: "vava",   name: "Vavá",      country: "Brasil",    flag: "🇧🇷", value: 7  }
  ],
  // streak + distribution for the Stats modal
  stats: { played: 23, winRate: 78, streak: 4, best: 9, dist: [1,1,2,3,4,6,3,2,1] }, // dist for 2..10 acertos
  // archive sample (day, score 0-10 or null)
  archive: [7,9,5,8,10,6,4, 7,3,8,9,6,7,10, 5,8,7,9,6,4,7, 8,9,null,null,null,null,null]
};
