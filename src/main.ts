import { ApplicationConfig, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { members_response } from './data/member';
import { raid_response } from './data/raid';
import 'zone.js';
import { AppService } from './app.service';
import { MemberData, MemberRaidData, RaidData } from './app.model';
import { CopyClipboardDirective } from './copy-clipboard.directive';

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
                <div class="grid">
                    <div class="col-8">
                        <textarea pInputTextarea rows="100" [autoResize]="true" styleClass="source-text-area" 
                            [ngModel]="membersJson" (ngModelChange)="onMembersJsonChange($event)">
                        </textarea>
                    </div>
                    <div class="col-4">
                        <ul *ngIf="memberData">
                            <li *ngFor="let member of memberData.list">{{member}}</li>
                        </ul>
                    </div>
                </div>
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
            <div class="grid">
                <div class="col-8">
                    <textarea pInputTextarea rows="100" [autoResize]="true" styleClass="source-text-area" 
                        [ngModel]="raidJson" (ngModelChange)="onRaidJsonChange($event)">
                    </textarea>
                    </div>
                    <div class="col-4">
                        <ng-container *ngIf="raidData && memberData">
                            <p-button label="Copy" icon="pi pi-copy" size="small" [copy-clipboard]="getRawRaidData()" />
                            <br /><br />
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
                                        <td>{{member}}</td>
                                        <td>{{getTokens(member)}}</td>
                                        <td>{{getDamage(member).toLocaleString()}}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <br/>

                            <div class="field grid">
                                <span class="col-fixed font-bold" style="width:180px">Battle damage:</span>
                                <div class="col">
                                    <span>{{raidData.battleDamage.toLocaleString()}}</span>
                                </div>
                            </div>
                            <div class="field grid">
                                <span class="col-fixed font-bold" style="width:180px">Token damage:</span>
                                <div class="col">
                                    <span>{{raidData.bombDamage.toLocaleString()}}</span>
                                </div>
                            </div>
                            <div class="field grid">
                                <span class="col-fixed font-bold" style="width:180px">Total damage:</span>
                                <div class="col">
                                    <span>{{(raidData.battleDamage + raidData.bombDamage).toLocaleString()}}</span>
                                </div>
                            </div>
                        </ng-container>
                    </div>
                </div>
            </ng-template>
        </p-tabPanel>
    </p-tabView>
  `,
})
export class App {
  appService = inject(AppService);
  membersJson = '';
  memberData?: MemberData;
  raidJson = '';
  raidData?: RaidData;
  result = '';

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

      this.raidData.map.forEach((value, memberId: any) => {
        if (!memberIds.includes(memberId)) {
          throw Error('Missing member, ID: ' + memberId);
        }
      });
    } catch (e) {
      console.log(e);
      this.raidData = undefined;
    }
  }

  getMemberId(member: string): string {
    const memberId = this.memberData!.map.get(member);

    if (!memberId) {
      throw Error('Missing member, name: ' + member);
    }

    return memberId;
  }

  getMemberRaidData(member: string): MemberRaidData | undefined {
    const memberId = this.getMemberId(member);
    const memberRaidData = this.raidData!.map.get(memberId);

    return memberRaidData;
  }

  getTokens(member: string): number {
    const memberRaidData = this.getMemberRaidData(member);

    return memberRaidData ? memberRaidData.tokens : 0;
  }

  getDamage(member: string): number {
    const memberRaidData = this.getMemberRaidData(member);

    return memberRaidData ? memberRaidData.damage : 0;
  }

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

export const appConfig: ApplicationConfig = {
  providers: [provideAnimations()],
};

bootstrapApplication(App);
