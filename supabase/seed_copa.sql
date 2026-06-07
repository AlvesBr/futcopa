-- Copa dos Sonhos — Seed data (exported from local Docker 2026-06-07)
-- Run once against remote: supabase db query --linked < supabase/seed_copa.sql

-- Limpar dados existentes (ordem importa por FK)
TRUNCATE cup_players, cup_squads, cup_editions RESTART IDENTITY CASCADE;

-- ============================================================
-- cup_editions
-- ============================================================
INSERT INTO public.cup_editions VALUES ('159ae7f1-a2c3-4854-bf90-e0928facae20', 1970, 'México', 'Brasil', '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_editions VALUES ('599f08dc-ec9d-4753-a9ae-af1b4eb8f5aa', 1986, 'México', 'Argentina', '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_editions VALUES ('09a2194c-9d33-4562-bf61-4ce947c999f8', 1998, 'França', 'França', '2026-06-07 17:51:19.280331+00');

-- ============================================================
-- cup_squads
-- ============================================================
INSERT INTO public.cup_squads VALUES ('e118a839-4876-4d2c-abee-1d12080bca3a', '159ae7f1-a2c3-4854-bf90-e0928facae20', 'BR', 'Brasil',   '🇧🇷', 'CAMPEÃO',     86, '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_squads VALUES ('c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', '159ae7f1-a2c3-4854-bf90-e0928facae20', 'IT', 'Itália',   '🇮🇹', 'VICE',        69, '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_squads VALUES ('edcc43ef-9195-49dc-b669-2ccaa673a7a8', '159ae7f1-a2c3-4854-bf90-e0928facae20', 'DE', 'Alemanha', '🇩🇪', 'SEMI',        78, '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_squads VALUES ('d3e048ea-bf03-477a-b6dd-c50f3f3822f7', '599f08dc-ec9d-4753-a9ae-af1b4eb8f5aa', 'AR', 'Argentina','🇦🇷', 'CAMPEÃO',     81, '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_squads VALUES ('da674691-a862-437a-9a72-0e82a0750869', '09a2194c-9d33-4562-bf61-4ce947c999f8', 'FR', 'França',   '🇫🇷', 'CAMPEÃO',     84, '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_squads VALUES ('542d3398-5f1f-454b-bbad-0372b5c85ef7', '09a2194c-9d33-4562-bf61-4ce947c999f8', 'BR', 'Brasil',   '🇧🇷', 'VICE',        80, '2026-06-07 17:51:19.280331+00');

-- ============================================================
-- cup_players  (squad_id, squad_number, name, positions, rating_computed, rating_override, override_reason, photo_url, goals, assists, minutes_played)
-- ============================================================

-- Brasil 1970
INSERT INTO public.cup_players VALUES ('b022b86b-da99-49fd-8a9d-fb85d81184f2', 'e118a839-4876-4d2c-abee-1d12080bca3a', 1,  'Félix',       '{GOL}',     87, NULL, NULL, NULL, 0, 0, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('eb0d44f0-4bca-4f4b-b0dc-950322ad0418', 'e118a839-4876-4d2c-abee-1d12080bca3a', 2,  'C. Alberto',  '{LD}',      96, NULL, NULL, NULL, 1, 2, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('ef48b214-849f-42cf-a476-b9057bbe9c76', 'e118a839-4876-4d2c-abee-1d12080bca3a', 3,  'Everaldo',    '{LE}',      75, NULL, NULL, NULL, 0, 0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('449995dc-d6b9-4a10-a8a5-15e0a3478878', 'e118a839-4876-4d2c-abee-1d12080bca3a', 4,  'Piazza',      '{ZAG,MEI}', 62, NULL, NULL, NULL, 0, 0, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('173b3df6-d9ad-4ef3-aedb-90f1dbe58d44', 'e118a839-4876-4d2c-abee-1d12080bca3a', 5,  'Brito',       '{ZAG}',     81, NULL, NULL, NULL, 0, 0, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('cc120f4b-08b5-45e3-9294-742cd88c4d65', 'e118a839-4876-4d2c-abee-1d12080bca3a', 6,  'Clodoaldo',   '{MEI}',     80, NULL, NULL, NULL, 1, 1, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('fb8cecaf-490d-437f-857d-616dfd179551', 'e118a839-4876-4d2c-abee-1d12080bca3a', 7,  'Jairzinho',   '{PD,CA}',   99, NULL, NULL, NULL, 7, 3, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('97480444-1c51-4196-865d-025b762f6474', 'e118a839-4876-4d2c-abee-1d12080bca3a', 8,  'Gérson',      '{MEI}',     92, NULL, NULL, NULL, 1, 4, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('fc878622-ce26-4b83-9b50-ccceb40240ed', 'e118a839-4876-4d2c-abee-1d12080bca3a', 9,  'Tostão',      '{CA}',      92, NULL, NULL, NULL, 4, 5, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('dd37ee3f-703a-46dd-8efc-a77ff217a6de', 'e118a839-4876-4d2c-abee-1d12080bca3a', 10, 'Pelé',        '{CA}',      94, NULL, NULL, NULL, 4, 7, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('45d6dd25-b814-4a77-8c64-8bf8bcfc1e35', 'e118a839-4876-4d2c-abee-1d12080bca3a', 11, 'Rivelino',    '{PE,MEI}',  85, NULL, NULL, NULL, 3, 2, 630,  '2026-06-07 17:51:19.280331+00');

-- Itália 1970
INSERT INTO public.cup_players VALUES ('5d272992-8608-4b52-9d62-37fcc20e755f', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 1,  'Albertosi',   '{GOL}',     60, NULL, NULL, NULL, 0, 0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('a6281b39-8376-4aed-b415-e2820d6af77a', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 2,  'Burgnich',    '{LD,ZAG}',  75, NULL, NULL, NULL, 1, 0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('4e1a80b2-506f-4254-9e87-a970c9a0d6ac', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 3,  'Cera',        '{ZAG}',     67, NULL, NULL, NULL, 0, 0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('11b70861-e5d6-4f60-9c56-cabd6245900d', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 4,  'Rosato',      '{ZAG}',     60, NULL, NULL, NULL, 0, 0, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('546475b3-a880-4716-b8ce-abf89763a149', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 5,  'Facchetti',   '{LE}',      71, NULL, NULL, NULL, 0, 1, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('fdf05d77-956b-49ba-b7aa-c913d9a7dafa', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 6,  'Bertini',     '{MEI}',     61, NULL, NULL, NULL, 0, 0, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('f0718588-5f65-4c72-b3fe-023a4670cfbd', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 7,  'Domenghini',  '{PD}',      67, NULL, NULL, NULL, 1, 1, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('d23484d3-016d-4d46-aba4-dec0c8debe47', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 8,  'De Sisti',    '{MEI}',     65, NULL, NULL, NULL, 0, 1, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('88a05b31-7578-4fec-a8f4-65fcbf3a50f8', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 9,  'Boninsegna',  '{CA}',      71, NULL, NULL, NULL, 2, 1, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('207cc8a9-227c-42a3-9324-8bb759ca105a', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 10, 'Mazzola',     '{MEI,CA}',  75, NULL, NULL, NULL, 2, 3, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('853bc6e0-8a79-4326-af44-6a9364506e61', 'c27c80b8-3f9a-48d3-8dc0-c0c906ce165f', 11, 'Riva',        '{PE,CA}',   83, NULL, NULL, NULL, 4, 2, 540,  '2026-06-07 17:51:19.280331+00');

-- Alemanha 1970
INSERT INTO public.cup_players VALUES ('c5dbe2b2-f6c0-4d0e-9d29-8217a5447100', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 1,  'Maier',        '{GOL}',      68, NULL, NULL, NULL, 0,  0, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('d007714a-0fcc-4464-b6dc-cfd69dd9f646', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 2,  'Schulz',       '{ZAG}',      80, NULL, NULL, NULL, 0,  0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('04e2abb3-acf7-44b8-855d-2eb1ad034260', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 3,  'Schnellinger', '{LE}',       84, NULL, NULL, NULL, 1,  0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('309f8433-9553-4ee5-8021-b661a5cff82f', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 4,  'Vogts',        '{LD}',       65, NULL, NULL, NULL, 0,  0, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('e024a9d2-0566-447b-ac5f-a2fe79984f2c', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 5,  'Beckenbauer',  '{ZAG,MEI}',  99, NULL, NULL, NULL, 2,  3, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('67062d56-10db-4919-89b7-ede7b4655106', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 8,  'Overath',      '{MEI}',      89, NULL, NULL, NULL, 2,  2, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('39945f9c-8e2f-44f3-9cdd-949ab15f4bdc', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 7,  'Held',         '{PD,CA}',    74, NULL, NULL, NULL, 2,  1, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('e4a9364a-7d1c-4817-a773-52866d5e5ca0', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 10, 'Grabowski',    '{PE,PD}',    65, NULL, NULL, NULL, 0,  2, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('61aa1cf7-0438-4a0d-a610-f19458a2fc7a', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 11, 'Libuda',       '{PD}',       60, NULL, NULL, NULL, 0,  1, 270,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('30b73ba2-bce6-4f2a-ac8e-89e7ae51e05e', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 9,  'Müller',       '{CA}',       97, NULL, NULL, NULL, 10, 2, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('83281b90-d2e1-49fc-874a-8b89edaecb25', 'edcc43ef-9195-49dc-b669-2ccaa673a7a8', 13, 'Seeler',       '{CA}',       81, NULL, NULL, NULL, 3,  2, 540,  '2026-06-07 17:51:19.280331+00');

-- Argentina 1986
INSERT INTO public.cup_players VALUES ('4777a77e-c87a-42de-bd27-e75fe25c01a2', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 1,  'Pumpido',        '{GOL}',     87, NULL, NULL, NULL, 0, 0, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('9bff9b96-0132-46c1-bd6e-a1536d5b73e7', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 2,  'Cuciuffo',       '{LD}',      62, NULL, NULL, NULL, 0, 0, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('55767745-f5ac-4090-9a5f-46c0fc1e4f02', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 3,  'Olarticoechea',  '{LE}',      88, NULL, NULL, NULL, 0, 1, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('e60c78f9-aa17-4d43-af32-375b315cd3b3', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 4,  'Ruggeri',        '{ZAG}',     90, NULL, NULL, NULL, 1, 0, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('d84dc728-b3de-4465-b0a4-921753d3d7a6', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 5,  'Brown',          '{ZAG}',     90, NULL, NULL, NULL, 1, 0, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('a93b980f-f1f6-4cde-bb27-c2f4064ed4eb', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 6,  'Burruchaga',     '{MEI}',     87, NULL, NULL, NULL, 1, 3, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('30afd97f-6b5a-4c76-8766-66616e11004a', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 7,  'Valdano',        '{CA,PE}',   88, NULL, NULL, NULL, 3, 3, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('971cf3eb-44ec-436d-9382-321b392a574a', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 8,  'Giusti',         '{MEI}',     70, NULL, NULL, NULL, 0, 1, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('ef0a9e12-29a0-47fa-9d67-347414911abe', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 9,  'Batista',        '{MEI}',     67, NULL, NULL, NULL, 0, 0, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('ee044923-2369-4ef1-bbc5-5284f9625adc', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 10, 'Maradona',       '{MEI,CA}',  99, NULL, NULL, NULL, 5, 5, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('d1b5ba6b-bfe0-43b2-966c-b0168b9ed06b', 'd3e048ea-bf03-477a-b6dd-c50f3f3822f7', 11, 'Enrique',        '{PE}',      62, NULL, NULL, NULL, 0, 1, 270,  '2026-06-07 17:51:19.280331+00');

-- França 1998
INSERT INTO public.cup_players VALUES ('4263c594-50ad-43f6-a51e-51f55cc52e8e', 'da674691-a862-437a-9a72-0e82a0750869', 1,  'Barthez',    '{GOL}',      99, NULL, NULL, NULL, 0, 0, 690,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('1e4a8a30-1189-4d20-a793-76fca8300353', 'da674691-a862-437a-9a72-0e82a0750869', 2,  'Thuram',     '{LD,ZAG}',   97, NULL, NULL, NULL, 2, 0, 690,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('38005983-038e-4cd1-b5f1-4f6cdd4902b0', 'da674691-a862-437a-9a72-0e82a0750869', 3,  'Lizarazu',   '{LE}',       83, NULL, NULL, NULL, 0, 1, 600,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('760ffed4-7820-48fb-9fd4-ea0d9938090c', 'da674691-a862-437a-9a72-0e82a0750869', 4,  'Desailly',   '{ZAG,MEI}',  75, NULL, NULL, NULL, 0, 0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('fc945365-2c19-4e41-bed3-8e86460c8088', 'da674691-a862-437a-9a72-0e82a0750869', 5,  'Blanc',      '{ZAG}',      86, NULL, NULL, NULL, 1, 0, 600,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('f949b6f5-1a24-465b-9a90-b503807a2537', 'da674691-a862-437a-9a72-0e82a0750869', 6,  'Deschamps',  '{MEI}',      82, NULL, NULL, NULL, 0, 0, 690,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('a68ccc42-c08a-4232-a6a3-8fae15343739', 'da674691-a862-437a-9a72-0e82a0750869', 7,  'Petit',      '{MEI}',      84, NULL, NULL, NULL, 1, 1, 600,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('3b0ad107-c30a-4e90-98b6-af2e45781da9', 'da674691-a862-437a-9a72-0e82a0750869', 8,  'Djorkaeff',  '{MEI,PD}',   72, NULL, NULL, NULL, 1, 2, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('afb3a252-bffd-4d32-ad20-31521552643d', 'da674691-a862-437a-9a72-0e82a0750869', 10, 'Zidane',     '{MEI}',      97, NULL, NULL, NULL, 2, 5, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('99ba0ae2-bf89-4b63-802d-2b3f2218d013', 'da674691-a862-437a-9a72-0e82a0750869', 20, 'Trezeguet',  '{CA}',       69, NULL, NULL, NULL, 1, 1, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('d9bb2ea7-84b3-4974-afd3-790024c51581', 'da674691-a862-437a-9a72-0e82a0750869', 12, 'Henry',      '{PE,CA}',    78, NULL, NULL, NULL, 3, 2, 540,  '2026-06-07 17:51:19.280331+00');

-- Brasil 1998
INSERT INTO public.cup_players VALUES ('6c489660-849e-473d-99db-981d894677e8', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 1,  'Taffarel',      '{GOL}',      76, NULL, NULL, NULL, 0, 0, 690,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('7a5c05ff-bf2e-46e5-935b-731f57cbadd6', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 2,  'Cafu',          '{LD}',       93, NULL, NULL, NULL, 0, 2, 690,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('9e3c1e48-f56c-4b9c-abf2-a0a27c347182', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 3,  'R. Carlos',     '{LE}',       93, NULL, NULL, NULL, 0, 2, 690,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('67ca403d-f4e9-44ce-9289-8b88d98dfbfd', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 4,  'Aldair',        '{ZAG}',      78, NULL, NULL, NULL, 0, 0, 600,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('cdca12b7-40bb-47a5-bf7e-70bb4f8175c5', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 5,  'César Sampaio', '{ZAG,MEI}',  70, NULL, NULL, NULL, 2, 0, 450,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('c9706014-59c4-4ae3-82de-481cfd1980ac', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 6,  'Júnior Baiano', '{ZAG}',      67, NULL, NULL, NULL, 0, 0, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('7b97de0b-fdab-4c28-b83b-16f730dedc7d', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 7,  'Émerson',       '{MEI}',      61, NULL, NULL, NULL, 0, 0, 360,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('f7b1b114-0c61-456f-b9b4-38446394f6d0', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 8,  'Dunga',         '{MEI}',      77, NULL, NULL, NULL, 0, 0, 690,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('8214d7e4-c9c3-47d8-a854-4e9487e03da1', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 10, 'Ronaldo',       '{CA}',       90, NULL, NULL, NULL, 4, 3, 630,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('98c63c8e-ce51-4cf4-9118-d2e814851970', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 9,  'Bebeto',        '{CA}',       76, NULL, NULL, NULL, 3, 2, 540,  '2026-06-07 17:51:19.280331+00');
INSERT INTO public.cup_players VALUES ('6b6436bb-6e8d-49c1-85bd-7975a7ee633d', '542d3398-5f1f-454b-bbad-0372b5c85ef7', 20, 'Rivaldo',       '{MEI,PE}',   94, NULL, NULL, NULL, 3, 3, 630,  '2026-06-07 17:51:19.280331+00');
