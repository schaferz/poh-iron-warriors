import {Component, inject, OnInit} from "@angular/core";
import {FieldChartComponent} from "./chart/field-chart.component";
import {
    SeasonInfoTableCalcType,
    SeasonInfoTableCalcTypeExtendedOptions,
    SeasonInfoTableCalcTypeLabel
} from "../../model";
import {SelectButtonModule} from "primeng/selectbutton";
import {FormsModule} from "@angular/forms";
import {SeasonService} from "../../service";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {CommonModule} from "@angular/common";

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    standalone: true,
    imports: [CommonModule, FieldChartComponent, SelectButtonModule, FormsModule, ProgressSpinnerModule]
})
export class DashboardComponent implements OnInit {

    seasonService = inject(SeasonService);

    calcTypeOptions = SeasonInfoTableCalcTypeExtendedOptions;

    calcType = SeasonInfoTableCalcType.totalDamage;

    calcLabel = SeasonInfoTableCalcTypeLabel;

    loaded = false;

    ngOnInit() {
        this.seasonService.currentRaidSeasonData().subscribe(() => this.loaded = true);
    }
}
