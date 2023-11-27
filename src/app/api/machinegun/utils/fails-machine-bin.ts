import { Value } from '@vality/machinegun-proto/internal/msgpack';

export const FAILS_MACHINE_VALUE: Value = {
    bin: JSON.stringify({ content_type: 'base64', content: 'g2o=' }),
};
