import {Component, Input} from "@angular/core";
import {Button} from "primeng/button";
import {CommonModule} from "@angular/common";
import {CopyClipboardDirective} from "../copy-clipboard.directive";
import {MemberData, MemberRaidData, RaidData} from "../app.model";

/**
 * Egy adott "kör" adatait megjelenítő komponens.
 */
@Component({
    selector: "app-raid-loop",
    template: `
        <ng-container *ngIf="raidData && memberData">
            <p-button label="Copy" icon="pi pi-copy" size="small"
                      [copy-clipboard]="getRawRaidData()"/>
            <br/><br/>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Token</th>
                    <th>Damage</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let member of memberData.list">
                    <td>{{ member }}</td>
                    <td>{{ getTokens(member) }}</td>
                    <td>{{ getDamage(member).toLocaleString() }}</td>
                </tr>
                </tbody>
            </table>

            <br/>

            <div class="field grid">
                <span class="col-fixed font-bold" style="width:180px">Battle damage:</span>
                <div class="col">
                    <span>{{ raidData.battleDamage.toLocaleString() }}</span>
                </div>
            </div>
            <div class="field grid">
                <span class="col-fixed font-bold" style="width:180px">Bomb damage:</span>
                <div class="col">
                    <span>{{ raidData.bombDamage.toLocaleString() }}</span>
                </div>
            </div>
            <div class="field grid">
                <span class="col-fixed font-bold" style="width:180px">Total damage:</span>
                <div class="col">
                    <span>{{ (raidData.battleDamage + raidData.bombDamage).toLocaleString() }}</span>
                </div>
            </div>
        </ng-container>
    `,
    imports: [
        Button,
        CommonModule,
        CopyClipboardDirective
    ],
    standalone: true
})
export class RaidLoopComponent {

    /** A raid response-ból előállított infó. */
    @Input()
    raidData?: RaidData;

    /** A guild response-ból előállított tagság infó. */
    @Input()
    memberData?: MemberData;

    /**
     * Név alapján (pl. Azoth) a tag egyedi azonosítója. Hibát dob ha nem található a tag-ok között név!
     *
     * @param member a tag neve
     * @return a tag azonosítója
     */
    getMemberId(member: string): string {
        const memberId = this.memberData!.map.get(member);

        if (!memberId) {
            throw Error('Missing member, name: ' + member);
        }

        return memberId;
    }

    /**
     * @param member tag neve
     * @return tag-hoz tartozó raid adatok
     */
    getMemberRaidData(member: string): MemberRaidData | undefined {
        const memberId = this.getMemberId(member);

        return this.raidData!.map.get(memberId);
    }

    /**
     * @param member tag neve
     * @return tag által használt raid token-ek
     */
    getTokens(member: string): number {
        const memberRaidData = this.getMemberRaidData(member);

        return memberRaidData ? memberRaidData.tokens : 0;
    }

    /**
     * @param member tag neve
     * @return tag sebzése
     */
    getDamage(member: string): number {
        const memberRaidData = this.getMemberRaidData(member);

        return memberRaidData ? memberRaidData.damage : 0;
    }

    /**
     * Adatok előállítása tab-al tag-olt formában, mely beilleszthető egy munkalapba.
     */
    getRawRaidData(): string {
        if (!this.memberData) {
            return '';
        }

        let result = ' ';

        this.memberData.list.forEach((m) => {
            result += `${this.getTokens(m)}\t${this.getDamage(m)}\n`;
        });

        return result.substring(0, result.length - 1).trim();
    }
}
