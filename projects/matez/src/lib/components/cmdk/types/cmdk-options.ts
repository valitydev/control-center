import { Signal } from '@angular/core';

import { CmdkOption } from './cmdk-option';

export interface CmdkOptions {
    search: (searchStr: string) => void;
    options: Signal<CmdkOption[]>;
    progress?: Signal<boolean>;
}
