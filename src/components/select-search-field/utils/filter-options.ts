import { Option } from '../types';

const filterPredicate =
    <T>(searchStr: string) =>
    (option: Option<T>) =>
        option.label.toLowerCase().includes(searchStr) ||
        (option.description && option.description.toLowerCase().includes(searchStr)) ||
        (typeof option.value !== 'object' &&
            String(option.value).toLowerCase().includes(searchStr));

export const filterOptions = <T>(options: Option<T>[], controlValue: unknown): Option<T>[] =>
    controlValue && typeof controlValue === 'string'
        ? options?.filter(filterPredicate(controlValue.toLowerCase()))
        : options;
