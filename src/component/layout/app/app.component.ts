import {Component, inject, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {TabViewModule} from "primeng/tabview";
import {InputTextareaModule} from "primeng/inputtextarea";
import {CopyClipboardDirective} from "../../../directive";
import {SupabaseService} from "../../../service";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {NavigationEnd, Router, RouterEvent, RouterModule, RoutesRecognized} from "@angular/router";
import {ToastModule} from "primeng/toast";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {LoadingIndicatorComponent} from "../loading/loading-indicator.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule,
        TabViewModule,
        InputTextareaModule,
        CopyClipboardDirective,
        RouterModule,
        SidebarComponent,
        ToastModule,
        ConfirmPopupModule,
        LoadingIndicatorComponent
    ],
    templateUrl: "./app.component.html",
})
export class App implements OnInit {
    supabaseService = inject(SupabaseService);

    router = inject(Router);

    data?: any;

    url = '';

    ngOnInit() {

        this.router.events
            .subscribe(event => {
                if (event instanceof NavigationEnd) {
                    this.updateRoute(event as RouterEvent);
                } else if (event instanceof RoutesRecognized) {
                    const route = event.state.root.firstChild;

                    this.data = route?.data;
                }
            });


    }

    updateRoute(event: RouterEvent) {
        this.url = event.url;
    }

    logout() {
        this.supabaseService.signOut();
    }
}
