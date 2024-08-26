import {Member} from "../model";

export function jsonToMember(obj: any): Member {
    return {
        user_id: obj.userId,
        display_name: obj.displayName,
        level: obj.level,
        role: obj.role,
        active: true
    };
}

export function parseMembersJson(json: string): Member[] {
    const obj = JSON.parse(json);
    const eventResults = obj.eventResults;
    const result: Member[] = [];

    eventResults.forEach((er: any) => {
        const members = er.eventResponseData.guild.members;

        members.forEach((m: any) => {
            result.push(jsonToMember(m));
        });
    });

    return result;
}
