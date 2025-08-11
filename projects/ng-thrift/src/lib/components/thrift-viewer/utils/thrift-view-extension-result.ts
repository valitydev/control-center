import { Router } from '@angular/router';

import { Color } from '@vality/matez';

export interface ThriftViewExtensionResult {
    key?: string;
    value?: unknown;
    hidden?: boolean;
    tooltip?: unknown;
    link?: Parameters<Router['navigate']>;
    click?: () => void;
    color?: Color;
}
