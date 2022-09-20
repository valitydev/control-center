import { Injectable, NgZone } from '@angular/core';
import {
    FileData,
    FileDataID,
    FileNotFound,
    Metadata,
    NewFileResult,
    URL,
} from '@vality/file-storage-proto';
import { Timestamp } from '@vality/file-storage-proto/lib/base';
import * as FileStorage from '@vality/file-storage-proto/lib/file_storage/gen-nodejs/FileStorage';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
export class FileStorageService extends ThriftService {
    constructor(
        zone: NgZone,
        keycloakTokenInfoService: KeycloakTokenInfoService,
        keycloakService: KeycloakService
    ) {
        super(zone, keycloakTokenInfoService, keycloakService, '/file_storage', FileStorage);
    }

    createNewFile = (metadata: Metadata, expiresAt: Timestamp): Observable<NewFileResult> =>
        this.toObservableAction('CreateNewFile')(metadata, expiresAt);

    generateDownloadUrl = (
        fileDataId: FileDataID,
        expiresAt: Timestamp
    ): Observable<URL | FileNotFound> =>
        this.toObservableAction('GenerateDownloadUrl')(fileDataId, expiresAt);

    getFileData = (fileDataId: FileDataID): Observable<FileData | FileNotFound> =>
        this.toObservableAction('GetFileData')(fileDataId);
}
