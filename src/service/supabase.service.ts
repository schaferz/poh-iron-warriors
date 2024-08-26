import {inject, Injectable, signal} from "@angular/core";
import {AuthSession, AuthTokenResponsePassword, createClient, SupabaseClient} from "@supabase/supabase-js";
import {EnviromentService} from "./enviroment.service";
import {from, map, Observable, tap} from "rxjs";
import {MessageService} from "primeng/api";
import {PostgrestQueryBuilder} from "@supabase/postgrest-js";
import {LoaderService} from "./loader.service";

@Injectable({
    providedIn: "root"
})
export class SupabaseService {

    messageService = inject(MessageService);

    loaderService = inject(LoaderService);

    supabase: SupabaseClient;

    authSession: AuthSession | null = null;

    enviromentService = inject(EnviromentService);

    loggedIn = signal(false);

    constructor() {
        this.supabase = createClient(this.enviromentService.getSupabaseUrl(), this.enviromentService.getSupabaseKey())
    }

    get session() {
        this.supabase.auth.getSession().then(({data}) => {
            this.authSession = data.session;
        })

        return this.authSession;
    }

    from(value: string): PostgrestQueryBuilder<any, any> {
        this.loaderService.loading.next(true);

        return this.supabase.from(value);
    }

    rpc(functionName: string, args: unknown) {
        return this.supabase.rpc(functionName, args);
    }

    signIn(email: string, password: string, next: (value: AuthTokenResponsePassword) => void) {
        const obs = from(this.supabase.auth.signInWithPassword({email, password}));

        this.handleDataResponse(obs)
            .subscribe((r) => {
                if (!r.error) {
                    this.loggedIn.set(true);
                    next(r);
                }
            });
    }

    signOut() {
        const obs = from(this.supabase.auth.signOut());

        this.handleDataResponse(obs).subscribe(() => {
            this.loggedIn.set(false);
        });
    }

    handleDataResponse<T>(observable: Observable<T>): Observable<any> {
        return observable.pipe(
            map((r: any) => {
                if (r.error) {
                    this.messageService.add({severity: 'error', summary: r.error.code, detail: r.error.message});
                    throw Error(`${r.error.code}: ${r.error.message}`);
                }

                this.loaderService.loading.next(false);

                return r.data;
            })
        );
    }

    handleActionResponse(obserable: Observable<any>): Observable<any> {
        return obserable.pipe(
            tap((r: any) => {
                if (r.error) {
                    this.messageService.add({severity: 'error', summary: r.error.code, detail: r.error.message});
                    throw Error(`${r.error.code}: ${r.error.message}`);
                }

                this.loaderService.loading.next(false);
            })
        );
    }
}
