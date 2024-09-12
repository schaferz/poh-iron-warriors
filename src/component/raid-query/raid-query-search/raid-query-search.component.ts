import {Component, EventEmitter, inject, OnInit, Output} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {BossService, SeasonService} from "../../../service";
import {Boss, RaidSeasonContribution, Season} from "../../../model";
import {map, switchMap} from "rxjs";

@Component({
    selector: "app-raid-query-search",
    standalone: true,
    templateUrl: "./raid-query-search.component.html",
    imports: [CommonModule, FormsModule, DropdownModule]
})
export class RaidQuerySearchComponent implements OnInit {

    seasonService = inject(SeasonService);

    bossService = inject(BossService);

    @Output()
    bossChange = new EventEmitter<Boss>();

    @Output()
    contributionChange = new EventEmitter<RaidSeasonContribution[]>();

    seasons?: Season[];

    bosses?: Boss[];

    seasonId?: number;

    boss?: Boss;

    ngOnInit() {
        this.seasonService.loadSeasons()
            .subscribe(s => this.onSeasonsLoaded(s));
    }

    onSeasonsLoaded(seasons: Season[]): void {
        this.seasons = seasons;
        if (seasons && seasons.length > 0) {
            this.seasonId = seasons[0].id;
        }
        this.loadBosses();
    }

    loadBosses(): void {
        if (this.seasonId) {
            this.seasonService.loadSeasonBossOrder(this.seasonId)
                .pipe(
                    switchMap(sb => {
                        return this.bossService.bosses()
                            .pipe(
                                map((bosses) => {
                                    return sb.map(bossId => {
                                        const res = bosses.find(b => b.id === bossId);

                                        if (!res) {
                                            throw Error(`Boss not found: ${bossId}`);
                                        }

                                        return res;
                                    });
                                })
                            );
                    })
                )
                .subscribe(r => this.bosses = r);
        } else {
            this.bosses = undefined;
        }
    }

    onSeasonChange(): void {
        this.boss = undefined;
        this.bossChange.emit(this.boss);
        this.contributionChange.emit(undefined);
        this.loadBosses();
    }

    onBossChange(boss: Boss): void {
        this.bossChange.emit(boss);

        if (boss) {
            this.seasonService.loadRaidSeasonContribution(this.seasonId)
                .pipe(
                    map(data => {
                        return data.filter(c => c.boss_id === boss.id && c.damage_type === "Battle")
                    })
                )
                .subscribe(data => {
                    this.contributionChange.emit(data);
                });
        }
    }
}
