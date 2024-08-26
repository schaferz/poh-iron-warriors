import {Component, inject, OnInit} from "@angular/core";
import {GuildService, SupabaseService} from "../../service";
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputTextareaModule} from "primeng/inputtextarea";
import {FormsModule} from "@angular/forms";
import {parseMembersJson} from "../../util";
import {Member} from "../../model";
import {TableModule} from "primeng/table";

@Component({
    selector: "app-guild",
    templateUrl: "./guild.component.html",
    imports: [ButtonModule, DialogModule, InputTextareaModule, FormsModule, TableModule],
    standalone: true
})
export class GuildComponent implements OnInit {

    supabaseService = inject(SupabaseService);

    guildService = inject(GuildService);

    dialogVisible = false;

    json?: string;

    members: Member[] = [];

    loggedIn = this.supabaseService.loggedIn;

    ngOnInit() {
        this.load();
    }

    save() {
        if (this.json) {
            const members = parseMembersJson(this.json);

            this.guildService.updateMembers(members)
                .subscribe((r) => {
                    this.members = r;
                    this.cancel();
                });
        }
    }

    cancel() {
        this.json = undefined;
        this.dialogVisible = false;
    }

    load() {
        this.guildService.activeMembers()
            .subscribe((r) => this.members = r);
    }
}
