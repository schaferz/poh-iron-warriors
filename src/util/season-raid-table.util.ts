import {Boss, Member, RaidSeasonBossData, RaidSeasonData, SeasonInfoTableData} from "../model";

export function createTableData(data: RaidSeasonData, bosses: Boss[], members: Member[]): SeasonInfoTableData {
    const result: SeasonInfoTableData = {
        rounds: [], columns: {
            tableColumns: [{name: "member", header: "Member"}]
        }, rows: {}
    };

    if (!data) {
        return result;
    }

    const {rounds, columns, rows} = result;
    const {sets, bossOrder} = data;

    // columns
    let colIdx = 1;

    for (const bossId of bossOrder) {
        const boss = bosses.find(b => b.id === bossId);

        if (boss) {
            result.columns.tableColumns.push({
                name: `damage${colIdx}`,
                tokenField: `token${colIdx}`,
                header: boss.name
            });
        } else {
            result.columns.tableColumns.push({name: `damage${colIdx}`, tokenField: `token${colIdx}`, header: "???"});
        }

        colIdx++;
    }

    result.columns.tableColumns.push({name: "calc", tokenField: "totalToken", header: "calc"});

    // rounds & rows
    for (const set of sets) {
        const loopKey = `l${set.loopIndex}`;

        rounds.push({name: loopKey, header: `Round ${set.loopIndex + 1}`});
        rows[loopKey] = createTableLoopData(data, members, set.loopIndex);
        rows[`${loopKey}Sum`] = createTableSumLoopData(data, rows[loopKey]);
    }

    rounds.push({name: 'total', header: "Total"});
    rows['total'] = createTableLoopData(data, members);
    rows[`totalSum`] = createTableSumLoopData(data, rows['total']);

    return result;
}

export function createTableLoopData(data: RaidSeasonData, members: Member[], loopIndex?: number): any {
    let bossData: { [key: string]: RaidSeasonBossData } = {};

    if (loopIndex === undefined) {
        bossData = data.bossData;
    } else {
        const set = data.sets.find(s => s.loopIndex === loopIndex);

        if (set) {
            bossData = set.bossData;
        }
    }

    const result: any[] = [];

    for (const member of members) {
        const row: any = {member: member.display_name, user_id: member.user_id};

        result.push(row);

        let colIdx = 1;

        for (const bossId of data.bossOrder) {
            const bs = bossData[bossId];

            if (bs && bs.userData[member.user_id]) {
                const bsUser = bs.userData[member.user_id];
                const {damage, bombDamage, tokenUsage} = bsUser;

                row[`token${colIdx}`] = tokenUsage;
                row[`damage${colIdx}`] = damage + bombDamage;
                colIdx++;
            } else {
                row[`token${colIdx}`] = 0;
                row[`damage${colIdx}`] = 0;
                colIdx++;
            }
        }
    }

    // calculated row fields
    for (const row of result) {
        const sumDamage = sumRowValue(row, 'damage');
        const sumToken = sumRowValue(row, 'token');

        row["totalToken"] = sumToken;
        row["totalDamage"] = sumDamage;
        row["averageDamage"] = sumToken > 0 ? sumDamage / sumToken : 0;
    }

    return result;
}

function createTableSumLoopData(data: RaidSeasonData, rows: any[]) {
    const sumRow: any = {member: "Total", sumRow: true};

    let colIdx = 1;

    for (const bossId of data.bossOrder) {
        const tokenKey = `token${colIdx}`;
        const damageKey = `damage${colIdx}`;

        sumRow[tokenKey] = sumColValue(rows, tokenKey);
        sumRow[damageKey] = sumColValue(rows, damageKey);

        const sumDamage = sumRowValue(sumRow, 'damage');
        const sumToken = sumRowValue(sumRow, 'token');

        sumRow["totalToken"] = sumToken;
        sumRow["totalDamage"] = sumDamage;
        sumRow["averageDamage"] = sumToken > 0 ? Math.trunc(sumDamage / sumToken) : 0;

        colIdx++;
    }

    return sumRow;
}

function sumRowValue(target: any, field: string): number {
    let result = 0;
    let idx = 1;

    while (target[`${field}${idx}`] !== undefined) {
        const value = target[`${field}${idx}`];

        idx++;

        if (value) {
            result += value;
        }
    }

    return result;
}

function sumColValue(target: any[], field: string) {
    let result = 0;

    for (const row of target) {
        const value = row[field];

        if (value) {
            result += value;
        }
    }

    return result;
}
