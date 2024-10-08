import {Component, inject, OnInit, ViewEncapsulation} from "@angular/core";
import {TableModule} from "primeng/table";
import {TabViewModule} from "primeng/tabview";
import {SeasonService} from "../../../service";
import {
    RaidSeasonData,
    SeasonInfoRounds,
    SeasonInfoTableCalcType,
    SeasonInfoTableCalcTypeLabel,
    SeasonInfoTableCalcTypeOptions,
    SeasonInfoTableColumns,
    SeasonInfoTableRow
} from "../../../model";
import {CommonModule} from "@angular/common";
import {SelectButtonModule} from "primeng/selectbutton";
import {FormsModule} from "@angular/forms";

@Component({
    selector: "app-season-info-panel",
    templateUrl: "./season-info-panel.html",
    styleUrls: ["./season-info-panel.scss"],
    standalone: true,
    imports: [CommonModule, TableModule, TabViewModule, SelectButtonModule, FormsModule],
    encapsulation: ViewEncapsulation.None
})
export class SeasonInfoPanel implements OnInit {

    seasonService = inject(SeasonService);

    data?: RaidSeasonData;

    tabs: SeasonInfoRounds = [];

    columns: SeasonInfoTableColumns = {tableColumns: []};

    rows: SeasonInfoTableRow = {};

    calcTypeOptions = SeasonInfoTableCalcTypeOptions;

    calcType = SeasonInfoTableCalcType.totalDamage;

    ngOnInit() {
        this.load();
    }

    load() {
        this.seasonService.currentRaidSeasonData().subscribe(r => {
            this.data = r;
            this.tabs = r.tableData.rounds;
            this.columns = r.tableData.columns;
            this.rows = r.tableData.rows;

            console.log(r.tableData);
        });
    }

    resolveColumnLabel(column: any): string {
        if (column.header === "calc") {
            return SeasonInfoTableCalcTypeLabel[this.calcType];
        }

        return column.header;
    }

    resolveSortColumn(column: any): string {
        if (column.name === 'calc') {
            return '';
        }

        return column.name;
    }

    resolveCellValue(column: any, row: any): string {
        let value = row[column.name];

        if (column.name === 'calc') {
            value = row[this.calcType];
        }

        if (column.name === 'member' || value === 0 || value === undefined) {
            return value;
        } else {
            return `${value.toLocaleString('hu-HU')} (${row[column.tokenField]})`;
        }
    }
}
