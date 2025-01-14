import { Field } from '@vality/thrift-ts';

export function isRequiredField(field: Field | undefined): boolean {
    return field?.option === 'required'; // optional even if not explicitly stated
}
