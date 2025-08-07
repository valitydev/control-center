import { Option } from '../types';

export function isSearchOption<T>(option: Option<T>, termLowerCase: string) {
    return (
        !!String(option.value)?.toLowerCase().includes?.(termLowerCase) ||
        !!option.label?.toLowerCase()?.includes(termLowerCase) ||
        !!option.description?.toLowerCase().includes?.(termLowerCase)
    );
}

export function searchOptions<T>(options: Option<T>[], term: string) {
    const termLowerCase = term.toLowerCase();
    return options?.filter?.((option) => isSearchOption(option, termLowerCase));
}
