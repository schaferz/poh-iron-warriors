import {SeasonInfoTableData} from "./raid-season-table";

export interface RaidSeasonContribution {
    boss_id: number;
    loop_index: number;
    user_id: string;
    damage_type: string;
    damage_dealt: number;
    encounter_id: number;
}

export interface RaidSeasonBossDataHolder {
    bossData: { [key: string]: RaidSeasonBossData };
}

export interface RaidSeasonData extends RaidSeasonBossDataHolder {
    sets: RaidSeasonSetData[];
    damage: number;
    bombDamage: number;
    tokenUsage: number;
    bossOrder: number[];
    tableData: SeasonInfoTableData;
}

export interface RaidSeasonSetData extends RaidSeasonBossDataHolder {
    loopIndex: number;
    damage: number;
    bombDamage: number;
    tokenUsage: number;
}

export interface RaidSeasonBossData {
    bossId: number;
    userData: { [key: string]: RaidSeasonUserData };
    damage: number;
    bombDamage: number;
    tokenUsage: number;
}

export interface RaidSeasonUserData {
    damage: number;
    bombDamage: number;
    tokenUsage: number;
}
