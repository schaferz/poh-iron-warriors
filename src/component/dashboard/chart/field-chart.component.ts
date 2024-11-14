import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {ChartComponent} from "./chart.component";
import {ChartModule} from "primeng/chart";
import {SeasonInfoTableCalcType} from "../../../model";

@Component({
    selector: "app-field-chart",
    imports: [ChartModule],
    template: `
        <p-chart type="bar" [data]="chartData" [options]="chartOptions"/>
    `,
    standalone: true
})
export class FieldChartComponent extends ChartComponent implements OnInit, OnChanges {

    @Input()
    title?: string;

    @Input()
    field?: string;

    ngOnChanges(changes: SimpleChanges) {
        this.onDataLoaded();
    }

    override onDataLoaded() {
        if (this.title && this.field && this.rows) {
            const labels: string[] = [];
            const data: number[] = [];
            const total = this.rows['total'];

            for (const row of total) {
                const {member, user_id} = row;
                let value = row[this.field];

                if (this.field === SeasonInfoTableCalcType.totalToken) {
                    const et = this.extraToken.get(user_id);

                    if (et) {
                        value += et;
                    }

                    console.log(`${member}: ${et}`);
                }

                labels.push(member);
                data.push(value);
            }

            this.applySimpleChartData(this.title, labels, data);
        }
    }
}
