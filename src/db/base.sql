-- boss
CREATE TABLE boss
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
ALTER TABLE boss
    ADD CONSTRAINT unique_boss_name UNIQUE (name);
ALTER TABLE boss
    ADD COLUMN side1 VARCHAR(100);
ALTER TABLE boss
    ADD COLUMN side2 VARCHAR(100);

INSERT INTO boss (name)
VALUES ('Avatar of Khaine'),
       ('Ghazghkull'),
       ('Hive Tyrant'),
       ('Mortarion'),
       ('Rogal Dorn'),
       ('Screamer-Killer'),
       ('Szarekh'),
       ('Tervigon');

INSERT INTO boss (name)
VALUES ('Szarekh II');

UPDATE boss SET side1 = 'Aethana', side2 = 'Eldryon' WHERE name = 'Avatar of Khaine';
UPDATE boss SET side1 = 'Gibbascrapz', side2 = 'Tanksmasha' WHERE name = 'Ghazghkull';
UPDATE boss SET side1 = 'Alpha Prime', side2 = 'Omega Prime' WHERE name = 'Hive Tyrant';
UPDATE boss SET side1 = 'Nauseous Rotbone', side2 = 'Corrodius' WHERE name = 'Mortarion';
UPDATE boss SET side1 = 'Sibyll Devine', side2 = 'Thaddeus Noble' WHERE name = 'Rogal Dorn';
UPDATE boss SET side1 = 'Neurothrope', side2 = 'Winged Prime' WHERE name = 'Screamer-Killer';
UPDATE boss SET side1 = 'Menhir and Hapthatra', side2 = 'Menhir and Mesophet' WHERE name = 'Szarekh';
UPDATE boss SET side1 = 'Alpha Prime', side2 = 'Omega Prime' WHERE name = 'Tervigon';

-- member
DROP TABLE IF EXISTS member;
CREATE TABLE member
(
    id           SERIAL PRIMARY KEY,
    user_id      VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    role         VARCHAR(20)  NOT NULL
);
ALTER TABLE member
    ADD COLUMN active BOOLEAN DEFAULT TRUE;
ALTER TABLE member
    ADD COLUMN level INT;

-- season
CREATE TABLE season
(
    id                    SERIAL PRIMARY KEY,
    season                INT          NOT NULL,
    season_started_on     TIMESTAMP,
    season_ends_on        TIMESTAMP,
    season_toggles_on     TIMESTAMP,
    next_season_starts_on TIMESTAMP,
    season_config_id      VARCHAR(100) NOT NULL
);
ALTER TABLE season
    DROP COLUMN season_started_on;
ALTER TABLE season
    DROP COLUMN season_ends_on;
ALTER TABLE season
    DROP COLUMN season_toggles_on;
ALTER TABLE season
    DROP COLUMN next_season_starts_on;
ALTER TABLE season
    DROP COLUMN season_config_id;
ALTER TABLE season
    ADD COLUMN created_on TIMESTAMP DEFAULT NOW();
ALTER TABLE season
    ADD CONSTRAINT unique_season UNIQUE (season);

-- season boss order
CREATE TABLE season_boss_order
(
    id        SERIAL PRIMARY KEY,
    season_id INT REFERENCES season (id) NOT NULL,
    boss_id   INT REFERENCES boss (id)   NOT NULL,
    index     INT                        NOT NULL
);

-- set
CREATE TABLE set
(
    id              SERIAL PRIMARY KEY,
    season_id       INT REFERENCES season (id) NOT NULL,
    tier            INT,
    min_bomb_damage INT,
    max_bomb_damage INT,
    chest_id        VARCHAR(100)
);
ALTER TABLE set
    ADD COLUMN set_id VARCHAR(100) UNIQUE;
ALTER TABLE set
    ADD COLUMN boss_id VARCHAR(100) NOT NULL;
ALTER TABLE set
    ALTER COLUMN boss_id TYPE INT USING boss_id::INTEGER;
ALTER TABLE set
    DROP COLUMN min_bomb_damage;
ALTER TABLE set
    DROP COLUMN max_bomb_damage;
ALTER TABLE set
    DROP COLUMN chest_id;
ALTER TABLE set
    ADD COLUMN loop_index INT;

-- encounter
CREATE TABLE encounter
(
    id           SERIAL PRIMARY KEY,
    set_id       INT REFERENCES set (id)  NOT NULL,
    boss_id      INT REFERENCES boss (id) NOT NULL,
    type         VARCHAR(100),
    encounter_id INT,
    enemy_hp     INT
);

-- battle_contributions
DROP TABLE IF EXISTS battle_contributions;
CREATE TABLE battle_contributions
(
    id           SERIAL PRIMARY KEY,
    encounter_id INT REFERENCES encounter (id)            NOT NULL,
    user_id      VARCHAR(100) REFERENCES member (user_id) NOT NULL,
    damage_dealt INT,
    damage_type  VARCHAR(20),
    started_on   TIMESTAMP,
    completed_on TIMESTAMP
);
ALTER TABLE battle_contributions
    DROP COLUMN started_on;
ALTER TABLE battle_contributions
    DROP COLUMN completed_on;

-- extra_token_usage
CREATE TABLE extra_token_usage
(
    id        SERIAL PRIMARY KEY,
    season_id INT REFERENCES season (id)               NOT NULL,
    user_id   VARCHAR(100) REFERENCES member (user_id) NOT NULL
);

ALTER TABLE extra_token_usage ADD COLUMN count INT;
CREATE INDEX idx_extra_token_usage_season_id ON extra_token_usage(season_id);
CREATE UNIQUE INDEX extra_token_usage_idx on extra_token_usage (season_id, user_id);

-- member update
CREATE OR REPLACE FUNCTION public.update_members(payload json) RETURNS SETOF public.member AS
$BODY$
DECLARE
    json_cursor CURSOR FOR SELECT *
                           FROM JSON_POPULATE_RECORDSET(NULL::public.member, payload);
    db_cursor CURSOR FOR SELECT *
                         FROM public.member;
    found BOOLEAN := FALSE;
BEGIN
    UPDATE public.member SET active = FALSE WHERE active = TRUE;

    FOR json_row IN json_cursor
        LOOP
            found := FALSE;

            FOR db_row IN db_cursor
                LOOP
                    IF db_row.user_id = json_row.user_id THEN
                        found := TRUE;
                    END IF;
                END LOOP;

            IF found THEN
                UPDATE public.member
                SET display_name = json_row.display_name,
                    active       = json_row.active,
                    level        = json_row.level
                WHERE user_id = json_row.user_id;
                RAISE NOTICE 'UPDATE: %', json_row.display_name;
            ELSE
                EXECUTE 'INSERT INTO public.member (user_id, display_name, role, active, level) VALUES ($1, $2, $3, $4, $5)'
                    USING json_row.user_id, json_row.display_name, json_row.role, json_row.active, json_row.level;
                RAISE NOTICE 'INSERT: %', json_row.display_name;
            END IF;
        END LOOP;
    RETURN QUERY SELECT * FROM public.member WHERE active = TRUE ORDER BY display_name;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- new season
CREATE OR REPLACE FUNCTION new_season(payload json) RETURNS VOID AS
$BODY$
DECLARE
    current_season INT := (SELECT season
                           FROM public.season
                           ORDER BY season DESC
                           LIMIT 1);
    last_season_id INT;
    item           INT;
    idx            INT = 0;
BEGIN
    IF current_season IS NOT NULL THEN
        INSERT INTO public.season (season) VALUES (current_season + 1);
    ELSE
        INSERT INTO public.season (season) VALUES (1);
    END IF;

    last_season_id := LASTVAL();

    FOR item IN SELECT * FROM JSON_ARRAY_ELEMENTS(payload)
        LOOP
            INSERT INTO public.season_boss_order (season_id, boss_id, index)
            VALUES (last_season_id, item, idx);
            idx := idx + 1;
        END LOOP;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- clear boss data
CREATE OR REPLACE FUNCTION clear_season_boss_data(p_boss_id INT) RETURNS VOID AS
$BODY$
DECLARE
    current_season_id INT := (SELECT id
                              FROM public.season
                              ORDER BY season DESC
                              LIMIT 1);
BEGIN
    -- clear battle_contributions
    DELETE
    FROM public.battle_contributions bc
    WHERE encounter_id IN (SELECT e.id
                           FROM public.encounter e,
                                public.set s
                           WHERE e.set_id = s.id
                             AND s.boss_id = p_boss_id
                             AND s.season_id = current_season_id);

    -- clear encounter
    DELETE
    FROM public.encounter bc
    WHERE set_id IN (SELECT s.id
                     FROM public.set s
                     WHERE s.boss_id = p_boss_id
                       AND s.season_id = current_season_id);

    -- clear set
    DELETE FROM public.set WHERE boss_id = p_boss_id AND season_id = current_season_id;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

CREATE OR REPLACE FUNCTION clear_season_set_data(p_set_id VARCHAR) RETURNS VOID AS
$BODY$
DECLARE
    current_season_id INT := (SELECT id
                              FROM public.season
                              ORDER BY season DESC
                              LIMIT 1);
BEGIN
    -- clear battle_contributions
    DELETE
    FROM public.battle_contributions bc
    WHERE encounter_id IN (SELECT e.id
                           FROM public.encounter e,
                                public.set s
                           WHERE e.set_id = s.id
                             AND s.set_id = p_set_id
                             AND s.season_id = current_season_id);

    -- clear encounter
    DELETE
    FROM public.encounter bc
    WHERE set_id IN (SELECT s.id
                     FROM public.set s
                     WHERE s.set_id = p_set_id
                       AND s.season_id = current_season_id);

    -- clear set
    DELETE FROM public.set WHERE set_id = p_set_id AND season_id = current_season_id;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- update battle contributions
CREATE OR REPLACE FUNCTION update_battle_contributions(p_encounter_id INT, bc JSON) RETURNS VOID AS
$BODY$
DECLARE
    item JSON;
BEGIN
    INSERT INTO public.battle_contributions (encounter_id, user_id, damage_dealt, damage_type)
    VALUES (p_encounter_id, bc ->> 'userId', (bc ->> 'damageDealt')::INT, bc ->> 'damageType');
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- update raid encounter
CREATE OR REPLACE FUNCTION update_raid_encounter(p_set_id INT, p_boss_id INT, payload JSON) RETURNS VOID AS
$BODY$
DECLARE
    item                 JSON;
    current_encounter_id INT;
BEGIN
    INSERT INTO public.encounter (set_id, boss_id, type, encounter_id, enemy_hp)
    VALUES (p_set_id, p_boss_id, payload ->> 'type', (payload ->> 'encounterId')::INT,
            (payload ->> 'enemyHp')::INT);

    current_encounter_id := LASTVAL();

    RAISE NOTICE 'Enc: %', current_encounter_id;

    FOR item IN SELECT * FROM JSON_ARRAY_ELEMENTS(payload -> 'battleContributions')
        LOOP
            PERFORM public.update_battle_contributions(current_encounter_id, item);
        END LOOP;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- update set
CREATE OR REPLACE FUNCTION update_raid_set(p_season_id INT, p_boss_id INT, payload JSON) RETURNS VOID AS
$BODY$
DECLARE
    item           JSON;
    current_set_id INT;
BEGIN
    INSERT INTO public.set (season_id, boss_id, tier, set_id, loop_index)
    VALUES (p_season_id, p_boss_id, (payload ->> 'tier')::INT, payload ->> 'setId',
            COALESCE((payload ->> 'loopIndex')::INT, 0));

    current_set_id := LASTVAL();

    FOR item IN SELECT * FROM JSON_ARRAY_ELEMENTS(payload -> 'encounters')
        LOOP
            PERFORM public.update_raid_encounter(current_set_id, p_boss_id, item);
        END LOOP;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

CREATE OR REPLACE FUNCTION update_current_raid_set(p_boss_id INT, payload JSON) RETURNS VOID AS
$BODY$
DECLARE
    current_season_id INT := (SELECT id
                              FROM public.season
                              ORDER BY season DESC
                              LIMIT 1);
BEGIN
    PERFORM public.clear_season_set_data(payload ->> 'setId');
    PERFORM public.update_raid_set(current_season_id, p_boss_id, payload);
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- update raid
CREATE OR REPLACE FUNCTION update_raid(boss_id INT, payload json) RETURNS VOID AS
$BODY$
DECLARE
    current_season_id INT := (SELECT id
                              FROM public.season
                              ORDER BY season DESC
                              LIMIT 1);
    item              JSON;
BEGIN
    PERFORM public.clear_season_boss_data(boss_id);

    FOR item IN SELECT * FROM JSON_ARRAY_ELEMENTS(payload)
        LOOP
            PERFORM public.update_raid_set(current_season_id, boss_id, item);
        END LOOP;
END;
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- raid season contribution
DROP FUNCTION raid_season_contribution;
CREATE OR REPLACE FUNCTION raid_season_contribution(p_season_id INT DEFAULT NULL)
    RETURNS TABLE
            (
                boss_id      INT,
                loop_index   INT,
                user_id      VARCHAR,
                damage_type  VARCHAR,
                damage_dealt INT,
                encounter_id INT
            )
AS
$BODY$
DECLARE
    sid INT;
BEGIN
    IF p_season_id IS NOT NULL THEN
        sid := p_season_id;
    ELSE
        sid := (SELECT id
                FROM public.season
                ORDER BY season DESC
                LIMIT 1);
    END IF;

    RETURN QUERY
        SELECT s.boss_id, s.loop_index, bc.user_id, bc.damage_type, bc.damage_dealt, e.encounter_id
        FROM public.battle_contributions bc,
             public.encounter e,
             public.set s
        WHERE bc.encounter_id = e.id
          AND e.set_id = s.id
          AND s.season_id = sid;
END
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- raid season boss order
CREATE OR REPLACE FUNCTION raid_season_boss_order(p_season_id INT DEFAULT NULL)
    RETURNS TABLE
            (
                boss_id INT
            )
AS
$BODY$
DECLARE
    sid INT;
BEGIN
    IF p_season_id IS NOT NULL THEN
        sid := p_season_id;
    ELSE
        sid := (SELECT id
                FROM public.season
                ORDER BY season DESC
                LIMIT 1);
    END IF;

    RETURN QUERY
        SELECT sbo.boss_id FROM public.season_boss_order sbo WHERE sbo.season_id = sid ORDER BY sbo.index ASC;
END
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- extra token usage
CREATE OR REPLACE FUNCTION raid_season_extra_token(p_season_id INT DEFAULT NULL)
    RETURNS TABLE
            (
                user_id   VARCHAR,
                count     INT,
                season_id INT
            )
AS
$BODY$
DECLARE
    sid INT;
BEGIN
    IF p_season_id IS NOT NULL THEN
        sid := p_season_id;
    ELSE
        sid := (SELECT s.id
                FROM public.season s
                ORDER BY season DESC
                LIMIT 1);
    END IF;

    RETURN QUERY
        SELECT m.user_id, e.count, sid as season_id
        FROM public.extra_token_usage e,
             public.member m
        WHERE e.user_id = m.user_id
          AND e.season_id = sid
        UNION ALL
        SELECT m.user_id, 0 AS count, sid as season_id
        FROM public.member m
        WHERE m.active IS TRUE
          AND NOT EXISTS(SELECT e.id FROM public.extra_token_usage e WHERE m.user_id = e.user_id);
END
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

-- supabase policy
CREATE POLICY "Public select."
    ON "public"."season_boss_order"
    AS PERMISSIVE
    FOR SELECT
    TO PUBLIC
    USING (
    TRUE
    );

CREATE POLICY "Authenticated delete."
    ON season_boss_order FOR DELETE
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated insert."
    ON season_boss_order FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "Authenticated update."
    ON season_boss_order FOR UPDATE
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);
