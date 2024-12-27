import { Option } from '../types';

export function findOptionByValue<T>(options: Option<T>[], value: T) {
    return options?.find?.((o) => o.value === value);
}
