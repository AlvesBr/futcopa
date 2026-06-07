-- Copa dos Sonhos — Grants de acesso público (leitura anon)

-- cup_editions: leitura pública
GRANT SELECT ON cup_editions TO anon;
GRANT ALL    ON cup_editions TO service_role;

-- cup_squads: leitura pública
GRANT SELECT ON cup_squads TO anon;
GRANT ALL    ON cup_squads TO service_role;

-- cup_players: leitura pública
GRANT SELECT ON cup_players TO anon;
GRANT ALL    ON cup_players TO service_role;

-- View com rating efetivo: leitura pública
GRANT SELECT ON cup_players_with_rating TO anon;
GRANT SELECT ON cup_players_with_rating TO service_role;
