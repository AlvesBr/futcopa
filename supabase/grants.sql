-- Grants for PostgREST roles
-- Executed after schema init (02_grants.sql)

GRANT USAGE ON SCHEMA public TO anon, service_role;

-- players: public read
GRANT SELECT ON players TO anon;
GRANT ALL    ON players TO service_role;

-- puzzles: public read
GRANT SELECT ON puzzles TO anon;
GRANT ALL    ON puzzles TO service_role;

-- user_results: public insert + read
GRANT SELECT, INSERT ON user_results TO anon;
GRANT ALL             ON user_results TO service_role;

-- reports: public insert only
GRANT INSERT ON reports TO anon;
GRANT ALL    ON reports TO service_role;

-- puzzle_stats view: public read
GRANT SELECT ON puzzle_stats TO anon;
GRANT SELECT ON puzzle_stats TO service_role;
