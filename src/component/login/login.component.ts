import {Component, inject} from "@angular/core";
import {CheckboxModule} from "primeng/checkbox";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {NavigationService, SupabaseService} from "../../service";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    imports: [
        CheckboxModule,
        ButtonModule,
        InputTextModule,
        FormsModule
    ],
    standalone: true,
    host: {'class': 'w-full'}
})
export class LoginComponent {

    supabaseService = inject(SupabaseService);

    navigationService = inject(NavigationService);

    router = inject(Router);

    email = '';

    password = '';

    login() {
        this.supabaseService.signIn(this.email, this.password, (r) => {
            this.navigationService.back();
        });
    }
}
