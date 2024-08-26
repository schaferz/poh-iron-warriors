export type SeasonInfoRounds = { name: string, header: string }[];

export type SeasonInfoTableColumns = {
    tableColumns: { name: string, tokenField?: string, header: string }[];
};

export type SeasonInfoTableRow = { [key: string]: any[] };

export type SeasonInfoTableData = {
    rounds: SeasonInfoRounds,
    columns: SeasonInfoTableColumns,
    rows: SeasonInfoTableRow
};

export enum SeasonInfoTableCalcType {
    totalDamage = "totalDamage",
    averageDamage = "averageDamage",
    totalToken = "totalToken"
}

export const SeasonInfoTableCalcTypeLabel = {
    [SeasonInfoTableCalcType.totalDamage]: "Total damage",
    [SeasonInfoTableCalcType.averageDamage]: "Average damage",
    [SeasonInfoTableCalcType.totalToken]: "Token usage"
};

export const SeasonInfoTableCalcTypeOptions = [
    {
        value: SeasonInfoTableCalcType.totalDamage,
        label: SeasonInfoTableCalcTypeLabel[SeasonInfoTableCalcType.totalDamage]
    },
    {
        value: SeasonInfoTableCalcType.averageDamage,
        label: SeasonInfoTableCalcTypeLabel[SeasonInfoTableCalcType.averageDamage]
    }
];

export const SeasonInfoTableCalcTypeExtendedOptions = [
    ...SeasonInfoTableCalcTypeOptions,
    {
        value: SeasonInfoTableCalcType.totalToken,
        label: SeasonInfoTableCalcTypeLabel[SeasonInfoTableCalcType.totalToken]
    }
];
