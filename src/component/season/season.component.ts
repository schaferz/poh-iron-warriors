import {Component, inject, ViewChild} from "@angular/core";
import {ButtonModule} from "primeng/button";
import {TabViewModule} from "primeng/tabview";
import {SeasonNewDialog} from "./season-new-dialog/season-new-dialog";
import {SupabaseService} from "../../service";
import {ConfirmationService} from "primeng/api";
import {SeasonUpdateDialog} from "./season-update-dialog/season-update-dialog";
import {SeasonInfoPanel} from "./season-info-panel/season-info-panel";

@Component({
    selector: "app-season",
    templateUrl: "./season.component.html",
    standalone: true,
    imports: [ButtonModule, TabViewModule, SeasonNewDialog, SeasonUpdateDialog, SeasonInfoPanel]
})
export class SeasonComponent {

    supabaseService = inject(SupabaseService);

    confirmationService = inject(ConfirmationService);

    loggedIn = this.supabaseService.loggedIn;

    @ViewChild(SeasonNewDialog)
    newDialog?: SeasonNewDialog;

    @ViewChild(SeasonUpdateDialog)
    updateDialog?: SeasonUpdateDialog;

    @ViewChild(SeasonInfoPanel)
    seasonInfoPanel?: SeasonInfoPanel;

    showNewDialog(event: MouseEvent) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure you want start a new season?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.newDialog?.show();
            }
        });
    }

    showUpdateDialog() {
        this.updateDialog?.show();
    }

    onRaidDataUpdated() {
        this.seasonInfoPanel?.load();
    }
}
