import {RaidSeasonBossData, RaidSeasonBossDataHolder, RaidSeasonContribution, RaidSeasonData} from "../model";

export function createRaidSeasonData(contributions: RaidSeasonContribution[]): RaidSeasonData {
    const result: RaidSeasonData = {
        tableData: {
            rounds: [],
            columns: {tableColumns: []},
            rows: {}
        },
        bossOrder: [], bossData: {}, sets: [], damage: 0, bombDamage: 0, tokenUsage: 0
    };

    for (const contribution of contributions) {
        const {damage_type, user_id, damage_dealt} = contribution;

        applyDamageAndTokenData(result, damage_type, damage_dealt);
        applaySetData(result, contribution);
        applayBossData(result, contribution);
    }

    result.sets.sort((e1, e2) => e1.loopIndex - e2.loopIndex);

    return result;
}

function applaySetData(data: RaidSeasonData, contribution: RaidSeasonContribution): void {
    const {sets} = data;
    const {damage_type, user_id, damage_dealt, loop_index} = contribution;

    if (!sets[loop_index]) {
        sets[loop_index] = {bossData: {}, damage: 0, loopIndex: 0, bombDamage: 0, tokenUsage: 0};

        sets[loop_index].loopIndex = loop_index;
    }

    const set = sets[loop_index];

    applyDamageAndTokenData(set, damage_type, damage_dealt);
    applayBossData(set, contribution);
}

function applayBossData(bossHolder: RaidSeasonBossDataHolder, contribution: RaidSeasonContribution): void {
    const {boss_id, damage_type, damage_dealt} = contribution;
    const {bossData} = bossHolder;

    if (!bossData[boss_id]) {
        bossData[boss_id] = {bossId: 0, damage: 0, bombDamage: 0, tokenUsage: 0, userData: {}};

        bossData[boss_id].bossId = boss_id;
    }

    const boss = bossData[boss_id];

    applyDamageAndTokenData(boss, damage_type, damage_dealt);
    applayUserData(boss, contribution);
}

function applayUserData(bossData: RaidSeasonBossData, contribution: RaidSeasonContribution): void {
    const {damage_type, user_id, damage_dealt} = contribution;
    const {userData} = bossData;

    if (!userData[user_id]) {
        userData[user_id] = {damage: 0, bombDamage: 0, tokenUsage: 0};
    }

    const user = userData[user_id];

    applyDamageAndTokenData(user, damage_type, damage_dealt);
}

function applyDamageAndTokenData(target: any, damageType: string, damageDealt: number) {
    if (target && damageDealt) {
        if (damageType === "Battle") {
            target.damage += damageDealt;
            target.tokenUsage += 1;
        } else {
            target.bombDamage += damageDealt;
        }
    }
}
