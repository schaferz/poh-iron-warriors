import {Component, inject, OnInit} from "@angular/core";
import {RaidQuerySearchComponent} from "./raid-query-search/raid-query-search.component";
import {
    Boss,
    Member,
    RaidSeasonContribution,
    SeasonInfoTableCalcType,
    SeasonInfoTableCalcTypeExtendedOptions, SeasonInfoTableCalcTypeLabel
} from "../../model";
import {DEFAULT_CHART_OPTIONS} from "../../util";
import {ChartModule} from "primeng/chart";
import {GuildService} from "../../service";
import {CommonModule} from "@angular/common";
import {createRaidQueryChartData} from "../../util";
import {SelectButtonModule} from "primeng/selectbutton";
import {FormsModule} from "@angular/forms";

@Component({
    selector: "app-raid-query",
    standalone: true,
    templateUrl: "./raid-query.component.html",
    imports: [CommonModule, RaidQuerySearchComponent, ChartModule, SelectButtonModule, FormsModule]
})
export class RaidQueryComponent implements OnInit {

    guildService = inject(GuildService);

    chartOptions = DEFAULT_CHART_OPTIONS;

    calcTypeOptions = SeasonInfoTableCalcTypeExtendedOptions;

    calcType = SeasonInfoTableCalcType.totalDamage;

    members?: Member[];

    boss?: Boss;

    contributions?: RaidSeasonContribution[];

    data?: any;

    ngOnInit() {
        this.guildService.allMembers()
            .subscribe(r => this.members = r);
    }

    onBossChange(boss: Boss): void {
        this.boss = boss;
    }

    onContributionsChange(contributions: RaidSeasonContribution[]): void {
        this.contributions = contributions;
        this.updateChartData();
    }

    updateChartData() {
        if (this.members && this.contributions) {
            const result = createRaidQueryChartData(this.members, this.contributions, this.calcType);

            const datasets: any[] = [
                {
                    label: this.boss?.side1,
                    data: result.side1,
                    backgroundColor: "#157ffd"
                },
                {
                    label: this.boss?.name,
                    data: result.boss,
                    backgroundColor: "#ff1633"
                },
                {
                    label: this.boss?.side2,
                    data: result.side2,
                    backgroundColor: "#008107"
                }
            ];

            this.data = {datasets, labels: result.labels};
        }
    }
}
