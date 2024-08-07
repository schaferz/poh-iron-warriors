/** Adatok a guild tagokról. */
export interface MemberData {
    /** Tag név lista. */
    list: string[];

    /** Tag név - id map. */
    map: Map<string, string>;
}

/** Tag raid adat. */
export interface MemberRaidData {
    /** Használt raid token-ek. */
    tokens: number;

    /** Sebzés. */
    damage: number;
}

/** Raid adat. */
export interface RaidData {
    /** Támadásból okozott sebzés. */
    battleDamage: number;

    /** Bombával okozott sebzés. */
    bombDamage: number;

    /** Tag név - tag raid adat map. */
    map: Map<string, MemberRaidData>;
}
