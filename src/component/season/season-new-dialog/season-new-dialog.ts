import {Component, inject, Input, OnInit} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {PickListModule} from "primeng/picklist";
import {Boss} from "../../../model";
import {DragDropModule} from "primeng/dragdrop";
import {BossService, SeasonService} from "../../../service";
import {MessageService} from "primeng/api";

@Component({
    selector: "app-season-new-dialog",
    templateUrl: "./season-new-dialog.html",
    standalone: true,
    imports: [FormsModule, ButtonModule, DialogModule, PickListModule, DragDropModule]
})
export class SeasonNewDialog implements OnInit {

    bossService = inject(BossService);

    messageService = inject(MessageService);

    seasonService = inject(SeasonService);

    @Input()
    visible = false;

    bosses: Boss[] = [];

    sourceBosses: Boss[] = [];

    targetBosses: Boss[] = [];

    ngOnInit() {
        this.bossService.bosses().subscribe((r) => {
            this.bosses = r;
            this.reset();
        });
    }

    show() {
        this.visible = true;
    }

    save() {
        if (this.targetBosses.length !== 5) {
            this.messageService.add({
                severity: 'error',
                summary: "Boss list error",
                detail: `Required 5 bosses: ${this.targetBosses.length} != 5`
            });

            return;
        }

        this.seasonService.newSeason(this.targetBosses).subscribe(() => {
            this.messageService.add({
                severity: 'success',
                summary: "New season",
                detail: "New season created successfully"
            });

            this.visible = false;
            this.reset();
        });
    }

    cancel() {
        this.visible = false;
        this.reset();
    }

    reset() {
        this.sourceBosses = [...this.bosses];
        this.targetBosses = [];
    }
}
