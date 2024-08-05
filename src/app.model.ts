export interface MemberData {
  list: string[];
  map: Map<string, string>;
}

export interface MemberRaidData {
  tokens: number;
  damage: number;
}

export interface RaidData {
  battleDamage: number;
  bombDamage: number;
  map: Map<string, MemberRaidData>;
}
