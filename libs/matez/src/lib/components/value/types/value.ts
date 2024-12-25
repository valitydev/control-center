import { MenuValue } from '../components/menu-value.component';
import { CurrencyAmountValue } from '../utils/currency-amount-value-to-string';
import { DatetimeValue } from '../utils/datetime-value-to-string';

import { BaseValue } from './base-type';

type TypedBaseValue = BaseValue & { type?: never };
export type Value = TypedBaseValue | DatetimeValue | MenuValue | CurrencyAmountValue;
