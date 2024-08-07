import {ApplicationConfig, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {TabViewModule} from 'primeng/tabview';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ButtonModule} from 'primeng/button';
import {members_response} from './data/member';
import {raid_response} from './data/raid';
import 'zone.js';
import {AppService} from './app.service';
import {MemberData, RaidData} from './app.model';
import {CopyClipboardDirective} from './copy-clipboard.directive';
import {MemberComponent} from "./component/member.component";
import {RaidComponent} from "./component/raid.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        FormsModule,
        TabViewModule,
        InputTextareaModule,
        CopyClipboardDirective,
        MemberComponent,
        RaidComponent
    ],
    template: `
        <p-tabView styleClass="tabview-custom" [activeIndex]="1">
            <p-tabPanel>
                <ng-template pTemplate="header">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-user"></i>
                        <span class="font-bold white-space-nowrap m-0">
                        Members
                    </span>
                    </div>
                </ng-template>
                <ng-template pTemplate="content">
                    <app-member [membersJson]="membersJson" [memberData]="memberData"
                                (membersJsonChange)="onMembersJsonChange($event)"></app-member>
                </ng-template>
            </p-tabPanel>
            <p-tabPanel>
                <ng-template pTemplate="header">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-list"></i>
                        <span class="font-bold white-space-nowrap m-0">
                        Raid
                    </span>
                    </div>
                </ng-template>
                <ng-template pTemplate="content">
                    <app-raid [raidJson]="raidJson" [raidData]="raidData" [memberData]="memberData"
                              (raidJsonChange)="onRaidJsonChange($event)">
                    </app-raid>
                </ng-template>
            </p-tabPanel>
        </p-tabView>
    `,
})
export class App {
    appService = inject(AppService);

    /** A response-ban kapott guild infó JSON. */
    membersJson = '';

    /** A guild response-ból előállított tagság infó. */
    memberData?: MemberData;

    /** A response-ban kapott raid infó JSON. */
    raidJson = '';

    /** A raid response-ból előállított infó. */
    raidData?: RaidData[];

    constructor() {
        this.onMembersJsonChange(JSON.stringify(members_response, null, 2));
        this.onRaidJsonChange(JSON.stringify(raid_response, null, 2));
    }

    onMembersJsonChange(value: string) {
        this.membersJson = value;
        try {
            this.memberData = this.appService.parseMembersJson(value);
        } catch (e) {
            this.memberData = undefined;
        }

        this.onRaidJsonChange(this.raidJson);
    }

    onRaidJsonChange(value: string) {
        this.raidJson = value;

        if (!this.memberData || !this.raidJson) {
            this.raidData = undefined;
            return;
        }

        try {
            this.raidData = this.appService.parseRaidJson(value);
            const memberIds: string[] = Array.from(this.memberData!.map.values());

            this.raidData.forEach(rd => {
                rd.map.forEach((value, memberId: any) => {
                    if (!memberIds.includes(memberId)) {
                        throw Error('Missing member, ID: ' + memberId);
                    }
                });
            });
        } catch (e) {
            console.error(e);
            this.raidData = undefined;
        }
    }
}

export const appConfig: ApplicationConfig = {
    providers: [provideAnimations()],
};

bootstrapApplication(App, appConfig);
