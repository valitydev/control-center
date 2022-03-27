import { ProviderObject } from '@vality/domain-proto/lib/domain';

import { TerminalInfo } from './terminal-info';

export interface ProviderInfo {
    provider: ProviderObject;
    terminalsInfo: TerminalInfo[];
}
