import { ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import * as moment from 'moment';

export const sortUnitsByCreatedAtAsc = <T extends ModificationUnit>(units: T[]): T[] =>
    units.slice().sort(({ created_at: a }, { created_at: b }) => moment(a).diff(moment(b)));
