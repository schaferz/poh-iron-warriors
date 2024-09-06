import {Component, inject, OnInit} from "@angular/core";
import {BossService, SupabaseService} from "../../service";
import {ButtonModule} from "primeng/button";
import {Boss} from "../../model";
import {TableModule} from "primeng/table";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {ConfirmationService, MessageService} from "primeng/api";
import {CommonModule} from "@angular/common";

@Component({
    selector: "app-boss",
    templateUrl: "./boss.component.html",
    imports: [CommonModule, TableModule, FormsModule, InputTextModule, ButtonModule],
    standalone: true
})
export class BossComponent implements OnInit {

    messageService = inject(MessageService);

    bossService = inject(BossService);

    supabaseService = inject(SupabaseService);

    confirmationService = inject(ConfirmationService);

    loggedIn = this.supabaseService.loggedIn;

    data: Boss[] = [];

    ngOnInit() {
        this.load();
    }

    load() {
        this.bossService.bosses().subscribe(r => this.data = r);
    }

    onInsert(): void {
        this.data = [...[{name: "", side1: "", side2: ""}], ...this.data];
    }

    onChange(boss: Boss): void {
        this.bossService.upsertBoss(boss)
            .subscribe((r) => {
                const index = this.data.indexOf(boss);
                this.data = this.data.slice(0);
                this.data[index] = r;

                this.messageService.add({
                    severity: 'success',
                    summary: "Save success",
                    detail: `Boss saved: ${boss.name}`
                });
            });
    }

    onDelete(event: MouseEvent, boss: Boss): void {
        if (boss.id === undefined) {
            const index = this.data.indexOf(boss);
            this.data = [...this.data.slice(0, index), ...this.data.slice(index + 1)];

            return;
        }

        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Are you sure you want delete the boss?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const index = this.data.indexOf(boss);
                this.data = [...this.data.slice(0, index), ...this.data.slice(index + 1)];

                if (boss.id) {
                    this.bossService.deleteBoss(boss)
                        .subscribe(() => {
                            this.messageService.add({
                                severity: 'success',
                                summary: "Delete success",
                                detail: `Boss deleted: ${boss.name}`
                            });
                        });
                }
            }
        });
    }
}
