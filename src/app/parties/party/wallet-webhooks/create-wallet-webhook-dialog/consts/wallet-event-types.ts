import { EventType } from '@vality/fistful-proto/webhooker';

export const WALLET_EVENT_TYPES: EventType = {
    withdrawal: {
        started: {},
        succeeded: {},
        failed: {},
    },
    destination: {
        created: {},
    },
};
