import {inject, Injectable} from "@angular/core";
import {SupabaseService} from "./supabase.service";
import {from, Observable, shareReplay, Subject, takeUntil, tap} from "rxjs";
import {Member} from "../model";

@Injectable({
    providedIn: "root"
})
export class GuildService {

    service = inject(SupabaseService);

    private memberReload$ = new Subject();

    private memberCache$?: Observable<Member[]>;

    activeMembers(): Observable<Member[]> {
        if (!this.memberCache$) {
            this.memberCache$ = this.listActiceMembers().pipe(
                takeUntil(this.memberReload$),
                shareReplay(1)
            )
        }

        return this.memberCache$;
    }

    listActiceMembers(): Observable<Member[]> {
        const query = this.service
            .from("member")
            .select("*")
            .eq("active", true)
            .order("display_name");

        return this.service.handleDataResponse(from(query));
    }

    updateMembers(members: Member[]): Observable<Member[]> {
        const query = this.service.rpc('update_members', {payload: members});

        return this.service.handleDataResponse(from(query)).pipe(tap(() => {
            this.memberReload$.next(undefined);
            this.memberCache$ = undefined;
        }));
    }
}
