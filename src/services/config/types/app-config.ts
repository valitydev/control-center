interface Endpoint {
    hostname: string;
    path?: string;
    port?: string;
    https?: boolean;
}

interface PresetConfig {
    paymentInstitution: number;
    category: number;
    termset?: number;
}

export const PRESETS = [
    {
        label: 'Production',
        value: 'prod',
    },
    {
        label: 'Test',
        value: 'test',
    },
] as const satisfies readonly { label: string; value: string }[];
export const DEFAULT_PRESET = PRESETS[0].value;
export type Preset = (typeof PRESETS)[number]['value'];

export interface AppConfig {
    api: {
        wachter: Endpoint;
    };
    checkout: Endpoint;
    default: Record<Preset, PresetConfig>;
}
