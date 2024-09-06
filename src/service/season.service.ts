import {inject, Injectable} from "@angular/core";
import {SupabaseService} from "./supabase.service";
import {Boss, RaidSeasonContribution, RaidSeasonData, Season} from "../model";
import {combineLatest, from, map, Observable, shareReplay, Subject, switchMap, takeUntil, tap} from "rxjs";
import {createRaidSeasonData, createTableData} from "../util";
import {GuildService} from "./guild.service";
import {BossService} from "./boss.service";

@Injectable({
    providedIn: "root"
})
export class SeasonService {

    service = inject(SupabaseService);

    guildService = inject(GuildService);

    bossService = inject(BossService);

    private currentSeasonReload$ = new Subject();

    private currentSeasonContributionCache$?: Observable<RaidSeasonContribution[]>;

    private currentSeasonDataCache$?: Observable<RaidSeasonData>;

    loadSeasons(): Observable<Season[]> {
        const query = this.service
            .from('season')
            .select(`id, season`)
            .order('id', {ascending: false});

        return this.service.handleDataResponse(from(query));
    }

    newSeason(bosses: Boss[]): Observable<unknown> {
        const bossIds = bosses.map(b => b.id);
        const query = this.service.rpc('new_season', {payload: bossIds});

        return this.service.handleDataResponse(from(query));
    }

    updateSeasonRaidData(bossId: number, sets: any): Observable<unknown> {
        const params = {boss_id: bossId, payload: sets};
        const query = this.service.rpc('update_raid', params);

        return this.service.handleDataResponse(from(query))
            .pipe(
                tap(() => this.clearCache())
            );
    }

    updateSeasonRaidSetData(bossId: number, set: any): Observable<unknown> {
        const params = {boss_id: bossId, payload: set};
        const query = this.service.rpc('update_current_raid_set', params);

        return this.service.handleDataResponse(from(query))
            .pipe(
                tap(() => this.clearCache())
            );
    }

    loadRaidSeasonContribution(seasonId?: number): Observable<RaidSeasonContribution[]> {
        const params: any = {};

        if (seasonId) {
            params.p_season_id = seasonId;
        }

        const query = this.service.rpc('raid_season_contribution', params);

        return this.service.handleDataResponse(from(query));
    }

    loadSeasonBossOrder(seasonId?: number): Observable<number[]> {
        const params: any = {};

        if (seasonId) {
            params.p_season_id = seasonId;
        }

        const query = this.service.rpc('raid_season_boss_order', params);

        return this.service.handleDataResponse(from(query)).pipe(
            map((r: any) => r.map((e: any) => e.boss_id))
        );
    }

    currentRaidSeasonContribution(): Observable<RaidSeasonContribution[]> {
        if (!this.currentSeasonContributionCache$) {
            this.currentSeasonContributionCache$ = this.loadRaidSeasonContribution().pipe(
                takeUntil(this.currentSeasonReload$),
                shareReplay(1)
            );
        }

        return this.currentSeasonContributionCache$;
    }

    currentRaidSeasonData(): Observable<RaidSeasonData> {
        if (!this.currentSeasonDataCache$) {
            this.currentSeasonDataCache$ = this.currentRaidSeasonContribution().pipe(
                map((d) => createRaidSeasonData(d)),
                // load boss order
                switchMap(rs => {
                    return this.loadSeasonBossOrder().pipe(
                        map(order => {
                            rs.bossOrder = order;

                            return rs;
                        })
                    );
                }),
                // load table data
                switchMap(rs => {
                    const members$ = this.guildService.activeMembers();
                    const bosses$ = this.bossService.bosses();

                    return combineLatest([bosses$, members$]).pipe(
                        map(([bosses, members]) => {
                            rs.tableData = createTableData(rs, bosses, members);

                            return rs;
                        })
                    );
                }),
                takeUntil(this.currentSeasonReload$),
                shareReplay(1)
            );
        }

        return this.currentSeasonDataCache$;
    }

    private clearCache() {
        this.currentSeasonReload$.next(null);
        this.currentSeasonContributionCache$ = undefined;
        this.currentSeasonDataCache$ = undefined;
    }
}
