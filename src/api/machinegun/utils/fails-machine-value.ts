import type { msgpack } from '@vality/machinegun-proto/state_processing';

// https://github.com/valitydev/holmes/blob/master/scripts/fail-machine.sh
export const FAILS_MACHINE_VALUE: msgpack.Value = {
    bin: JSON.stringify({ content_type: 'base64', content: 'g2o=' }),
};
