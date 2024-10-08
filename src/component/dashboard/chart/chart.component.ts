import {Component, inject, OnInit} from "@angular/core";
import {SeasonService} from "../../../service";
import {RaidSeasonData, SeasonInfoRounds, SeasonInfoTableColumns, SeasonInfoTableRow} from "../../../model";
import {DEFAULT_CHART_OPTIONS, orderChartData} from "../../../util";

@Component({
    template: ""
})
export abstract class ChartComponent implements OnInit {

    seasonService = inject(SeasonService);

    data?: RaidSeasonData;

    tabs: SeasonInfoRounds = [];

    columns: SeasonInfoTableColumns = {tableColumns: []};

    rows?: SeasonInfoTableRow;

    chartData?: { labels: string[]; datasets: any[] };

    chartOptions?: any;

    ngOnInit() {
        this.applyDefaultChartOptions();

        this.seasonService.currentRaidSeasonData().subscribe(r => {
            this.data = r;
            this.tabs = r.tableData.rounds;
            this.columns = r.tableData.columns;
            this.rows = r.tableData.rows;
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
