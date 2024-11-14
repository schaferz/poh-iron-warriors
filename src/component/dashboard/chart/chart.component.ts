import {Component, inject, OnInit} from "@angular/core";
import {SeasonService} from "../../../service";
import {RaidSeasonData, SeasonInfoRounds, SeasonInfoTableColumns, SeasonInfoTableRow} from "../../../model";
import {DEFAULT_CHART_OPTIONS, orderChartData} from "../../../util";
import {combineLatestWith} from "rxjs";

@Component({
    template: ""
})
export abstract class ChartComponent implements OnInit {

    seasonService = inject(SeasonService);

    data?: RaidSeasonData;

    tabs: SeasonInfoRounds = [];

    columns: SeasonInfoTableColumns = {tableColumns: []};

    rows?: SeasonInfoTableRow;

    extraToken: Map<string, number> = new Map();

    chartData?: { labels: string[]; datasets: any[] };

    chartOptions?: any;

    ngOnInit() {
        this.applyDefaultChartOptions();

        const raidSeasonData$ = this.seasonService.currentRaidSeasonData();
        const extraToken$ = this.seasonService.getExtraTokenUsageMap();

        raidSeasonData$.pipe(
            combineLatestWith(extraToken$)
        ).subscribe(([raidSeasonData, extraToken]) => {
            this.data = raidSeasonData;
            this.tabs = raidSeasonData.tableData.rounds;
            this.columns = raidSeasonData.tableData.columns;
            this.rows = raidSeasonData.tableData.rows;
            this.extraToken = extraToken;
            this.onDataLoaded();
        });
    }

    onDataLoaded() {

    }

    applyDefaultChartOptions(): any {
        this.chartOptions = DEFAULT_CHART_OPTIONS;
    }

    applySimpleChartData(title: string, labels: string[], data: number[]): any {
        const ordered = orderChartData(labels, data);
        const datasets: any[] = [{
            label: title,
            data: ordered.data,
            backgroundColor: "#157ffd"
        }];

        this.chartData = {datasets, labels: ordered.labels};
    }
}
