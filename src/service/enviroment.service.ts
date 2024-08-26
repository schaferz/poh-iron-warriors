import {Injectable} from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class EnviromentService {

    getSupabaseUrl(): string {
        return process.env['supabaseUrl']!;
    }

    getSupabaseKey(): string {
        return process.env['supabaseKey']!;
    }
}
