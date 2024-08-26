import {Component} from "@angular/core";
import {FieldChartComponent} from "./chart/field-chart.component";
import {
    SeasonInfoTableCalcType,
    SeasonInfoTableCalcTypeExtendedOptions,
    SeasonInfoTableCalcTypeLabel
} from "../../model";
import {SelectButtonModule} from "primeng/selectbutton";
import {FormsModule} from "@angular/forms";

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    standalone: true,
    imports: [FieldChartComponent, SelectButtonModule, FormsModule]
})
export class DashboardComponent {

    calcTypeOptions = SeasonInfoTableCalcTypeExtendedOptions;

    calcType = SeasonInfoTableCalcType.totalDamage;

    calcLabel = SeasonInfoTableCalcTypeLabel;

}
