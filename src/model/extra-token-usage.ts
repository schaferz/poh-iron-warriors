import {Entity} from "./entity";

export interface ExtraTokenUsage extends Entity {
    season_id: number;
    user_id: string;
    count: number;
}
