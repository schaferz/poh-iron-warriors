import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Button} from "primeng/button";
import {InputTextareaModule} from "primeng/inputtextarea";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MemberData, RaidData} from "../app.model";
import {AccordionModule} from "primeng/accordion";
import {RaidLoopComponent} from "./raid-loop.component";

/**
 * Raid response-ból a kimutatásokat megjelenítő komponens.
 */
@Component({
    selector: 'app-raid',
    template: `
        <div class="pb-2">
            <p-button label="Paste" icon="pi pi-clipboard" size="small" styleClass="mr-2" (onClick)="paste()"/>
            <p-button label="Clear" icon="pi pi-trash" size="small" (onClick)="this.raidJsonChange.emit('')"/>
        </div>
        <div class="grid">
            <div class="col-8">
                    <textarea pInputTextarea rows="100" styleClass="source-text-area"
                              [ngModel]="raidJson" (ngModelChange)="raidJsonChange.emit($event)">
                    </textarea>
            </div>
            <div class="col-4">
                <p-accordion [activeIndex]="0" *ngIf="raidData && memberData">
                    <ng-container *ngFor="let rd of raidData; index as i">
                        <p-accordionTab [header]="(raidData.length - i) + '. forduló'">
                            <app-raid-loop [raidData]="rd" [memberData]="memberData"></app-raid-loop>
                        </p-accordionTab>
                    </ng-container>
                </p-accordion>
            </div>
        </div>
    `,
    imports: [
        AccordionModule,
        Button,
        InputTextareaModule,
        CommonModule,
        FormsModule,
        RaidLoopComponent
    ],
    standalone: true
})
export class RaidComponent {
    /** A response-ban kapott raid infó JSON. */
    @Input()
    raidJson = '';

    /** A raid response-ból előállított infó. */
    @Input()
    raidData?: RaidData[];

    /** A guild response-ból előállított tagság infó. */
    @Input()
    memberData?: MemberData;

    /** A raid response változásának követése. */
    @Output()
    raidJsonChange = new EventEmitter();

    /** Beillesztés a vágólapról. */
    paste() {
        navigator.clipboard.readText().then(t => this.raidJsonChange.emit(t));
    }
}
