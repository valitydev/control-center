import { TerminalObject } from '@vality/domain-proto/lib/domain';
import Int64 from '@vality/thrift-ts/lib/int64';

import { PredicateType } from './predicate-type';

export interface TerminalInfo {
    terminal: TerminalObject;
    disabled: boolean;
    predicateType: PredicateType;
    weight: Int64;
    priority: Int64;
}
