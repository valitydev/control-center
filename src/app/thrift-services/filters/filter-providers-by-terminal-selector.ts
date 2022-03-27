import { ProviderObject } from '@vality/domain-proto/lib/domain';

export const filterProvidersByTerminalSelector = (
    objects: ProviderObject[],
    filterValue: 'decisions' | 'value'
): ProviderObject[] =>
    objects.filter((object) => {
        const selector = object.data.terminal;
        switch (filterValue) {
            case 'decisions':
                return selector?.decisions;
            case 'value':
                return selector?.value;
        }
    });
