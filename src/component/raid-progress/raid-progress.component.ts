import {Component, inject, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ChartModule} from "primeng/chart";
import {GuildService, SeasonService} from "../../service";
import {Member, RaidSeasonProgress, SeasonInfoTableCalcType, SeasonInfoTableCalcTypeExtendedOptions} from "../../model";
import {MultiSelectModule} from "primeng/multiselect";
import {DEFAULT_CHART_OPTIONS, randomChartColor} from "../../util";
import {SelectButtonModule} from "primeng/selectbutton";

@Component({
    selector: "app-raid-query",
    standalone: true,
    templateUrl: "./raid-progress.component.html",
    imports: [CommonModule, ChartModule, MultiSelectModule, FormsModule, ChartModule, SelectButtonModule]
})
export class RaidProgressComponent implements OnInit {

    seasonService = inject(SeasonService);

    guildService = inject(GuildService);

    calcType = SeasonInfoTableCalcType.totalDamage;

    calcTypeOptions = SeasonInfoTableCalcTypeExtendedOptions;

    members?: Member[];

    data?: RaidSeasonProgress[];

    selectedMembers: Member[] = [];

    chartOptions = DEFAULT_CHART_OPTIONS;

    chartData?: any;

    ngOnInit() {
        this.seasonService.raidSeasonProgress()
            .subscribe(r => this.data = r)
        this.guildService.listAllMembers()
            .subscribe(r => this.members = r);
    }

    onSelectedMembersChange(selectedMembers: Member[]) {
        this.selectedMembers = selectedMembers;
        this.updateChartData();
    }

    updateChartData() {
        if (!this.data || !this.selectedMembers) {
            return;
        }

        const labels = [...new Set(this.data.map(obj => `S${obj.season}`))];
        const datasets = [];

        for (const member of this.selectedMembers) {
            const data = this.data.filter(rs => rs.usr_id === member.user_id)
                .map(rs => this.resolveChartValue(rs));
            const dataset = {
                label: member.display_name,
                data: data,
                fill: false,
                borderColor: randomChartColor(),
                tension: 0.1
            };

            datasets.push(dataset);
        }

        this.chartData = {labels, datasets};
    }

    resolveChartValue(rs: RaidSeasonProgress) {
        if (this.calcType === SeasonInfoTableCalcType.totalDamage) {
            return rs.total_damage_percent;
        } else if (this.calcType === SeasonInfoTableCalcType.averageDamage) {
            return rs.avg_damage_percent;
        } else if (this.calcType === SeasonInfoTableCalcType.totalToken) {
            return rs.token_usage_percent;
        } else {
            return null;
        }
    }
}
