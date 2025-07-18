import { Observable } from 'rxjs';

import { ThriftData } from '../../../models';

import { ThriftViewExtensionResult } from './thrift-view-extension-result';

export type ThriftViewExtension<V = unknown> = {
    determinant: (data: ThriftData, value: unknown) => Observable<boolean>;
    extension: (
        data: ThriftData,
        value: V,
        viewValue: unknown,
    ) => Observable<ThriftViewExtensionResult>;
};
