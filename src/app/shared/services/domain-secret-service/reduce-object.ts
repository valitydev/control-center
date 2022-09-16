/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DomainObject } from '@vality/domain-proto';

export const reduceObject = (objectName: string, o: DomainObject): DomainObject => ({
    ...o,
    [objectName]: {
        ...o[objectName],
        data: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ...o[objectName].data,
            options: undefined,
        },
    },
});
