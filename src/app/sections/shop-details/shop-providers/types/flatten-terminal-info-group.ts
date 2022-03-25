import { TerminalID } from '@vality/fistful-proto';
import Int64 from '@vality/thrift-ts/lib/int64';

import { PredicateType } from './predicate-type';

export interface FlattenTerminalInfoGroup {
    terminalId: TerminalID;
    disabled: boolean;
    predicateType: PredicateType;
    priority: Int64;
    weight: Int64;
}
