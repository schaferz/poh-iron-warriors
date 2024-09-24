DROP FUNCTION raid_season_progress;
CREATE OR REPLACE FUNCTION raid_season_progress()
    RETURNS TABLE
            (
                season               INT,
                usr_id               VARCHAR,
                display_name         VARCHAR,
                avg_damage           NUMERIC,
                total_damage         NUMERIC,
                token_usage          NUMERIC,
                token_usage_percent  NUMERIC,
                total_damage_percent NUMERIC,
                avg_damage_percent   NUMERIC
            )
AS
$BODY$
BEGIN
    RETURN QUERY
        SELECT rd.season,
               rd.user_id                                                        usr_id,
               m.display_name,
               rd.avg_damage,
               rd.total_damage::NUMERIC,
               rd.token_usage::NUMERIC,
               ROUND(100 * rd.token_usage / SUM(rd.token_usage) OVER (), 1)   AS token_usage_percent,
               ROUND(100 * rd.total_damage / SUM(rd.total_damage) OVER (), 1) AS total_damage_percent,
               ROUND(100 * rd.avg_damage / SUM(rd.avg_damage) OVER (), 1)     AS avg_damage_percent
        FROM (SELECT se.season, bc.user_id, bc.avg_damage, bc.total_damage, bc.token_usage
              FROM public.season se
                       JOIN (SELECT s.season_id,
                                    user_id,
                                    AVG(b.damage_dealt) avg_damage,
                                    SUM(b.damage_dealt) total_damage,
                                    COUNT(1)            token_usage
                             FROM public.battle_contributions b,
                                  public.encounter e,
                                  public.set s
                             WHERE b.damage_type = 'Battle'
                               AND b.encounter_id = e.id
                               AND e.set_id = s.id
                             GROUP BY season_id, user_id) bc ON bc.season_id = se.id) rd
                 LEFT JOIN public.member m ON m.user_id = rd.user_id
        WHERE rd.season IN (SELECT s.season FROM public.season s LIMIT 5)
        ORDER BY rd.season, total_damage_percent DESC;
END
$BODY$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER
                     SET search_path = '';

SELECT * FROM raid_season_progress();