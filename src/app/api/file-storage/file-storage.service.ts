import { Injectable, Injector } from '@angular/core';
import {
    codegenClientConfig,
    CodegenClient,
} from '@vality/file-storage-proto/lib/file_storage-FileStorage';
import context from '@vality/file-storage-proto/lib/file_storage/context';
import * as service from '@vality/file-storage-proto/lib/file_storage/gen-nodejs/FileStorage';

import { createThriftApi } from '@cc/app/api/utils';

@Injectable({ providedIn: 'root' })
export class FileStorageService extends createThriftApi<CodegenClient>() {
    constructor(injector: Injector) {
        super(injector, {
            service,
            wachterServiceName: 'FileStorage',
            metadata: () =>
                import('@vality/file-storage-proto/lib/metadata.json').then((m) => m.default),
            context,
            ...codegenClientConfig,
        });
    }
}
