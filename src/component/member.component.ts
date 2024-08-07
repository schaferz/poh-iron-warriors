import {Component, EventEmitter, Input, Output} from "@angular/core";
import {InputTextareaModule} from "primeng/inputtextarea";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MemberData} from "../app.model";
import {ButtonModule} from "primeng/button";

/**
 * Guild response-ból a tagok listáját megjelenítő komponens.
 */
@Component({
    selector: "app-member",
    template: `
        <div class="pb-2">
            <p-button label="Paste" icon="pi pi-clipboard" size="small" styleClass="mr-2" (onClick)="paste()"/>
            <p-button label="Clear" icon="pi pi-trash" size="small" (onClick)="this.membersJsonChange.emit('')"/>
        </div>
        <div class="grid">
            <div class="col-8">
                <textarea pInputTextarea rows="100" [ngModel]="membersJson"
                          (ngModelChange)="membersJsonChange.emit($event)">
                </textarea>
            </div>
            <div class="col-4">
                <ul *ngIf="memberData">
                    <li *ngFor="let member of memberData.list">{{ member }}</li>
                </ul>
            </div>
        </div>
    `,
    imports: [
        InputTextareaModule,
        CommonModule,
        FormsModule,
        ButtonModule
    ],
    standalone: true
})
export class MemberComponent {

    /** A response-ban kapott guild infó JSON. */
    @Input()
    membersJson = '';

    /** A guild response-ból előállított tagság infó. */
    @Input()
    memberData?: MemberData;

    /** A guild response változásának követése. */
    @Output()
    membersJsonChange = new EventEmitter();

    /** Beillesztés a vágólapról. */
    paste() {
        navigator.clipboard.readText().then(t => this.membersJsonChange.emit(t));
    }
}
