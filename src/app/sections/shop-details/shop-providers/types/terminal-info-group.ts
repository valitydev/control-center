import { TerminalID } from '@vality/fistful-proto';
import Int64 from '@vality/thrift-ts/lib/int64';

import { PredicateType } from './predicate-type';

export interface TerminalInfoGroup {
    terminalIds: TerminalID[];
    weights: Int64[];
    priorities: Int64[];
    disabled: boolean;
    predicateType: PredicateType;
}
