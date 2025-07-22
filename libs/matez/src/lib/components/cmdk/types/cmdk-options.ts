import { PossiblyAsync } from '../../../utils';

import { CmdkOption } from './cmdk-option';

export interface CmdkOptions {
    search: (searchStr: string) => PossiblyAsync<CmdkOption[]>;
}
