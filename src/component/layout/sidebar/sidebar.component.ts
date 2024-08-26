import {Component, inject, OnInit} from "@angular/core";
import {NavigationEnd, Router, RouterEvent, RouterModule} from "@angular/router";
import {filter} from "rxjs";
import {CommonModule} from "@angular/common";
import {SupabaseService} from "../../../service/supabase.service";

@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"],
    imports: [
        CommonModule,
        RouterModule
    ],
    standalone: true
})
export class SidebarComponent implements OnInit {

    router = inject(Router);

    supabaseService = inject(SupabaseService);

    loggedIn = this.supabaseService.loggedIn;

    url = '';

    ngOnInit() {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(event => {
                this.updateRoute(event as RouterEvent);
            });
    }

    updateRoute(event: RouterEvent) {
        this.url = event.url;
    }

    navigateTo(path: string) {
        this.router.navigateByUrl(path);
    }
}
