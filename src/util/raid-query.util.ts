import {Member, RaidSeasonContribution, SeasonInfoTableCalcType} from "../model";

export interface RaidQueryMemberData {
    user_id: string;
    display_name: string;
    side1: number;
    boss: number;
    side2: number;
    total: number;
}

const CALC_FUNCTION_MAP: Map<SeasonInfoTableCalcType, (prm: RaidSeasonContribution[]) => number> = new Map([
    [SeasonInfoTableCalcType.totalDamage, calcTotalDamage],
    [SeasonInfoTableCalcType.totalToken, calcTotalToken],
    [SeasonInfoTableCalcType.averageDamage, calcAverageDamage],
]);

type SortFunction = (v1: RaidQueryMemberData, v2: RaidQueryMemberData) => number;
const SORT_FUNCTION_MAP: Map<SeasonInfoTableCalcType, SortFunction> = new Map([
    [SeasonInfoTableCalcType.totalDamage, (v1: RaidQueryMemberData, v2: RaidQueryMemberData) => v1.total - v2.total],
    [SeasonInfoTableCalcType.totalToken, (v1: RaidQueryMemberData, v2: RaidQueryMemberData) => v1.total - v2.total],
    [SeasonInfoTableCalcType.averageDamage, sortAverage],
]);

export function createRaidQueryChartData(members: Member[], contributions: RaidSeasonContribution[],
                                         calcType: SeasonInfoTableCalcType): any {
    const data: RaidQueryMemberData[] = createRaidQueryMemberDataArray(members, contributions);

    for (const memberData of data) {
        calcRaidQueryValue(memberData, contributions, calcType, null);
        calcRaidQueryValue(memberData, contributions, calcType, 1);
        calcRaidQueryValue(memberData, contributions, calcType, 2);
    }

    data.sort(SORT_FUNCTION_MAP.get(calcType));

    return {
        labels: data.map(m => m.display_name),
        side1: data.map(m => m.side1),
        boss: data.map(m => m.boss),
        side2: data.map(m => m.side2)
    };
}

function calcRaidQueryValue(member: RaidQueryMemberData, contributions: RaidSeasonContribution[],
                            calcType: SeasonInfoTableCalcType, encounter_id: number | null) {
    const ec = contributions.filter(c => c.encounter_id === encounter_id &&
        c.user_id === member.user_id);
    const fn = CALC_FUNCTION_MAP.get(calcType)!;
    const value = fn(ec);

    if (encounter_id === null) {
        member.boss = value;
    } else if (encounter_id === 1) {
        member.side1 = value;
    } else if (encounter_id === 2) {
        member.side2 = value;
    }

    member.total += value;
}

function calcTotalDamage(contributions: RaidSeasonContribution[]): number {
    let total = 0;

    for (const c of contributions) {
        total += c.damage_dealt;
    }

    return total;
}

function calcTotalToken(contributions: RaidSeasonContribution[]): number {
    return contributions.length;
}

function calcAverageDamage(contributions: RaidSeasonContribution[]): number {
    const totalDamage = calcTotalDamage(contributions);
    const totalToken = calcTotalToken(contributions);

    return totalToken > 0 ? totalDamage / totalToken : 0;
}

function createRaidQueryMemberDataArray(members: Member[], contributions: RaidSeasonContribution[]): RaidQueryMemberData[] {
    const data: RaidQueryMemberData[] = [];
    const userIds: string[] = [];

    for (const c of contributions) {
        const {user_id} = c;

        if (!userIds.includes(user_id)) {
            const member = members.find(m => m.user_id === user_id);

            if (!member) {
                throw new Error(`Member not found: ${user_id}`);
            }

            userIds.push(user_id);
            data.push({
                user_id,
                display_name: member.display_name,
                side1: 0,
                boss: 0,
                side2: 0,
                total: 0
            });
        }
    }

    return data;
}

function sortAverage(v1: RaidQueryMemberData, v2: RaidQueryMemberData): number {
    return Math.max(v1.boss, v1.side1, v1.side2) - Math.max(v2.boss, v2.side1, v2.side2);
}
