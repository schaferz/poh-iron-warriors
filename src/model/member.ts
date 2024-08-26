import {Entity} from "./entity";

export interface Member extends Entity {
    user_id: string;
    display_name: string;
    role: string;
    level?: number;
    active: boolean;
}
