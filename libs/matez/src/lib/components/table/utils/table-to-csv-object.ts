import { Value } from '../../value';
import { unknownToString } from '../../value/utils/unknown-to-string';
import { valueToString } from '../../value/utils/value-to-string';
import { ColumnData, DisplayedDataItem } from '../utils/to-columns-data';

export function tableToCsvObject<T extends object, C extends object>(
    cols: Value[],
    displayedData: Map<DisplayedDataItem<T, C>, ColumnData>,
): string[][] {
    const data = Array.from(displayedData.values()).map((columnData) =>
        columnData.map((v) => v.value),
    );

    const res = [
        cols
            .map((v) => {
                const res = valueToString(v);
                return [res, `${res} (description)`];
            })
            .flat(),
        ...data.map((r) =>
            r.map((c) => [valueToString(c), unknownToString(c?.description)]).flat(),
        ),
    ];
    // Removing empty description columns (every second column)
    let emptyCols = [];
    for (
        let i = 1;
        i < res[0].length;
        i += 2 // description - every second column
    ) {
        let isEmpty = true;
        for (
            let j = 1; // ignore header row
            j < res.length;
            ++j
        ) {
            if (res[j][i]) {
                isEmpty = false;
                break;
            }
        }
        if (isEmpty) {
            emptyCols.push(i);
        }
    }
    emptyCols = emptyCols.reverse();
    for (const i of emptyCols) {
        for (let j = 0; j < res.length; ++j) {
            res[j].splice(i, 1);
        }
    }
    return res;
}
