import {inject, Injectable} from "@angular/core";
import {SupabaseService} from "./supabase.service";
import {from, map, Observable, shareReplay, Subject, takeUntil, tap} from "rxjs";
import {Member} from "../model";

@Injectable({
    providedIn: "root"
})
export class GuildService {

    service = inject(SupabaseService);

    private activeMemberReload$ = new Subject();

    private activeMemberCache$?: Observable<Member[]>;

    private allMemberReload$ = new Subject();

    private allMemberCache$?: Observable<Member[]>;

    activeMembers(): Observable<Member[]> {
        if (!this.activeMemberCache$) {
            this.activeMemberCache$ = this.allMembers().pipe(
                map(ml => ml.filter(m => m.active)),
                takeUntil(this.activeMemberReload$),
                shareReplay(1)
            )
        }

        return this.activeMemberCache$;
    }

    allMembers(): Observable<Member[]> {
        if (!this.allMemberCache$) {
            this.allMemberCache$ = this.listAllMembers().pipe(
                takeUntil(this.allMemberReload$),
                shareReplay(1)
            )
        }

        return this.allMemberCache$;
    }

    listAllMembers(): Observable<Member[]> {
        const query = this.service
            .from("member")
            .select("*")
            .order("display_name");

        return this.service.handleDataResponse(from(query));
    }

    updateMembers(members: Member[]): Observable<Member[]> {
        const query = this.service.rpc('update_members', {payload: members});

        return this.service.handleDataResponse(from(query)).pipe(tap(() => {
            this.allMemberReload$.next(undefined);
            this.allMemberCache$ = undefined;

            this.activeMemberReload$.next(undefined);
            this.activeMemberCache$ = undefined;
        }));
    }
}
