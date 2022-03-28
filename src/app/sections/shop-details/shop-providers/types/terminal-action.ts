import { TerminalID } from '@vality/fistful-proto';

import { TerminalActionTypes } from './terminal-action-types';

export interface TerminalAction {
    type: TerminalActionTypes;
    terminalID: TerminalID;
}
