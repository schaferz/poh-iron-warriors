import {Component, inject, Input, OnInit} from "@angular/core";
import {GuildService, SeasonService} from "../../../service";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {DragDropModule} from "primeng/dragdrop";
import {ExtraTokenUsage, Member} from "../../../model";
import {CommonModule} from "@angular/common";
import {TableModule} from "primeng/table";
import {pipe, withLatestFrom} from "rxjs";

@Component({
    selector: 'app-season-extra-token-dialog',
    templateUrl: './season-extra-token-dialog.html',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, DragDropModule, TableModule]
})
export class SeasonExtraTokenDialog implements OnInit {

    guildService = inject(GuildService);

    seasonService = inject(SeasonService);

    extraTokenUsage?: ExtraTokenUsage[];

    members?: Member[];

    memberUserIdDisplayNameMap: Map<string, string> = new Map();

    @Input()
    visible = false;

    ngOnInit() {
        this.reset();
    }

    resolveName(userId: string) {
        return this.memberUserIdDisplayNameMap.get(userId) || userId;
    }

    inc(item: ExtraTokenUsage) {
        item.count = item.count + 1;
    }

    dec(item: ExtraTokenUsage) {
        item.count = item.count - 1;
    }

    show() {
        this.visible = true;
    }

    save() {
        if (this.extraTokenUsage) {
            this.seasonService.upsertExtraToken(this.extraTokenUsage)
                .subscribe(() => this.visible = false);
        }
    }

    cancel() {
        this.visible = false;
        this.reset();
    }

    reset() {
        const extraTokenUsage$= this.seasonService.listExtraTokenUsage();
        const activeMembers$ = this.guildService.activeMembers();

        extraTokenUsage$.pipe(
            withLatestFrom(activeMembers$)
        ).subscribe(([extraTokenUsage, activeMembers]) => {
            extraTokenUsage.forEach(i => {
                if (i.count === undefined) {
                    i.count = 0;
                }
            });

            activeMembers.forEach(m => {
                this.memberUserIdDisplayNameMap.set(m.user_id, m.display_name);
            });

            this.extraTokenUsage = extraTokenUsage;
            this.members = activeMembers;

            const memberMap = this.memberUserIdDisplayNameMap;

            this.extraTokenUsage.sort((a, b) => {
                const aN = memberMap.get(a.user_id)!;
                const bN = memberMap.get(b.user_id)!;

                return aN.localeCompare(bN);
            })
        });
    }
}
