import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';

import { MetadataFormData } from '@cc/app/shared';

export interface MetadataFormExtensionOption {
    value: unknown;
    label?: string;
    details?: string | object;
    color?: ThemePalette;
}

export interface MetadataFormExtensionResult {
    options?: MetadataFormExtensionOption[];
    generate?: () => Observable<unknown>;
    isIdentifier?: boolean;
    label?: string;
}

export type MetadataFormExtension = {
    determinant: (data: MetadataFormData) => Observable<boolean>;
    extension: (data: MetadataFormData) => Observable<MetadataFormExtensionResult>;
};
