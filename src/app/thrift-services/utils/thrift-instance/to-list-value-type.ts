import { ValueType } from '@vality/thrift-ts';

export const toListValueType = (valueType: string): ValueType => ({ name: 'list', valueType });
