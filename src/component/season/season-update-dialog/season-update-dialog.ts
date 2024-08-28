import {Component, EventEmitter, inject, Input, OnInit, Output} from "@angular/core";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {InputTextareaModule} from "primeng/inputtextarea";
import {PickListModule} from "primeng/picklist";
import {BossService, SeasonService} from "../../../service";
import {MessageService} from "primeng/api";
import {DropdownModule} from "primeng/dropdown";
import {Boss} from "../../../model";

@Component({
    selector: "app-season-update-dialog",
    templateUrl: "./season-update-dialog.html",
    standalone: true,
    imports: [DialogModule, FormsModule, ButtonModule, InputTextareaModule, PickListModule, DropdownModule]
})
export class SeasonUpdateDialog implements OnInit {

    bossService = inject(BossService);

    messageService = inject(MessageService);

    seasonService = inject(SeasonService);

    @Input()
    visible = false;

    @Output()
    updated: EventEmitter<void> = new EventEmitter();

    bosses: Boss[] = [];

    boss?: Boss;

    json?: string;

    ngOnInit() {
        this.bossService.bosses().subscribe((r) => this.bosses = r);
    }

    show() {
        this.visible = true;
    }

    save() {
        if (this.boss === undefined || this.boss.id === undefined) {
            this.showError("Boss error", "Boss is mandatory");
            return;
        }

        if (this.json === undefined || this.json.length === 0) {
            this.showError("Raid json error", "Raid json is mandatory");
            return;
        }

        const onSuccess = () => {
            this.messageService.add({
                severity: 'success',
                summary: "Raid data",
                detail: "Raid date updated successfully"
            });

            this.visible = false;
            this.updated.emit();
            this.reset();
        };

        try {
            const raidObj = JSON.parse(this.json);
            const respData = raidObj.eventResults[0].eventResponseData;

            if (respData.sets) {
                this.seasonService.updateSeasonRaidData(this.boss.id, respData.sets).subscribe(() => onSuccess());
            } else if (respData.guild) {
                const {guildBossGameMode} = respData.extension;
                const {currentSet} = guildBossGameMode;

                this.seasonService.updateSeasonRaidSetData(this.boss.id, currentSet);
            }
        } catch (e) {
            console.error(e);
            this.showError("Invalid raid json", `${e}`);
            return;
        }
    }

    cancel() {
        this.visible = false;
        this.reset();
    }

    reset() {
        this.boss = undefined;
        this.json = undefined;
    }

    private showError(title: string, message: string) {
        this.messageService.add({
            severity: 'error',
            summary: title,
            detail: message
        });
    }
}
