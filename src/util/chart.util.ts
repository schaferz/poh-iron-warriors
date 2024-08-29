export function orderChartData(labels: string[], data: number[]): { labels: string[], data: number[] } {
    const labelData = labels.map((l, idx) => {
        return {label: l, value: data[idx]};
    });

    labelData.sort((e1, e2) => e1.value - e2.value);

    return {
        labels: labelData.map(e => e.label),
        data: labelData.map(e => e.value),
    };
}
