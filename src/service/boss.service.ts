import {inject, Injectable} from "@angular/core";
import {SupabaseService} from "./supabase.service";
import {from, mergeMap, Observable, shareReplay, Subject, takeUntil, tap} from "rxjs";
import {Boss} from "../model";

@Injectable({
    providedIn: "root"
})
export class BossService {

    service = inject(SupabaseService);

    private bossReload$ = new Subject();

    private bossCache$?: Observable<Boss[]>;

    bosses(): Observable<Boss[]> {
        if (!this.bossCache$) {
            this.bossCache$ = this.listBosses().pipe(
                takeUntil(this.bossReload$),
                shareReplay(1)
            );
        }

        return this.bossCache$;
    }

    listBosses(): Observable<Boss[]> {
        const query = this.service
            .from('boss')
            .select(`id, name`);

        return this.service.handleDataResponse(from(query));
    }

    getBossByName(name: string): Observable<Boss> {
        const query = this.service
            .from('boss')
            .select(`id, name`)
            .eq('name', name)
            .single();

        return this.service.handleDataResponse(from(query));
    }

    getBossById(id: number): Observable<Boss> {
        const query = this.service
            .from('boss')
            .select(`id, name`)
            .eq('id', id)
            .single();

        return this.service.handleDataResponse(from(query));
    }

    upsertBoss(boss: Boss) {
        const query = this.service
            .from('boss')
            .upsert(boss);

        return this.service.handleActionResponse(from(query))
            .pipe(
                mergeMap(() => {
                    return boss.id ? this.getBossById(boss.id) : this.getBossByName(boss.name);
                }),
                tap(() => this.reloadBosses())
            );
    }

    deleteBoss(boss: Boss) {
        const query = this.service
            .from('boss')
            .delete()
            .eq('id', boss.id);

        return this.service.handleActionResponse(from(query))
            .pipe(
                tap(() => this.reloadBosses())
            );
    }

    private reloadBosses() {
        this.bossReload$.next(null);
        this.bossCache$ = undefined;
    }
}
