import {Injectable} from '@angular/core';
import {MemberData, RaidData} from './app.model';

@Injectable({providedIn: 'root'})
export class AppService {
    parseMembersJson(json: string): MemberData {
        const obj = JSON.parse(json);
        const eventResults = obj.eventResults;
        const result: MemberData = {
            list: [],
            map: new Map(),
        };

        eventResults.forEach((er: any) => {
            const members = er.eventResponseData.guild.members;

            members.forEach((m: any) => {
                result.list.push(m.displayName);
                result.map.set(m.displayName, m.userId);
            });
        });

        result.list.sort();

        return result;
    }

    parseRaidJson(json: string): RaidData[] {
        const obj = JSON.parse(json);
        const {eventResults} = obj;
        const result: RaidData[] = [];

        eventResults.forEach((er: any) => {
            const {eventResponseData} = er;
            const {sets, guild} = eventResponseData;

            if (sets) {
                sets.forEach((set: any) => this.parseSet(result, set));
            } else if (guild) {
                const {guildBossGameMode} = eventResponseData.extension;
                const {currentSet} = guildBossGameMode;
                const {encounters} = currentSet;
                const guildResult: RaidData = {
                    battleDamage: 0,
                    bombDamage: 0,
                    map: new Map(),
                };

                encounters.forEach((e: any) => this.parseEncounter(guildResult, e));

                result.push(guildResult)
            }
        });

        return result;
    }

    private parseSet(result: RaidData[], set: any): void {
        const {encounters} = set;
        const encounterResult: RaidData = {
            battleDamage: 0,
            bombDamage: 0,
            map: new Map(),
        };

        encounters.forEach((e: any) => {
            this.parseEncounter(encounterResult, e);
        });
        result.unshift(encounterResult);
    }

    private parseEncounter(result: RaidData, encounter: any): void {
        const {battleContributions} = encounter;

        battleContributions.forEach((b: any) =>
            this.parseBattleContribution(result, b)
        );
    }

    private parseBattleContribution(
        result: RaidData,
        battleContribution: any
    ): void {
        const {userId, damageType, damageDealt} = battleContribution;

        if (!damageDealt) {
            return;
        } else if (damageType !== 'Battle') {
            result.bombDamage += damageDealt;
        }

        if (!result.map.has(userId)) {
            result.map.set(userId, {tokens: 0, damage: 0});
        }

        const memberData = result.map.get(userId)!;

        memberData.damage = memberData.damage + damageDealt;

        if (damageType === 'Battle') {
            memberData.tokens = memberData.tokens + 1;
            result.battleDamage = result.battleDamage + damageDealt;
        }
    }
}
