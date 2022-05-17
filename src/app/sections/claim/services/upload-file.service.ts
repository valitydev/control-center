import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import moment from 'moment';
import { switchMap } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { FileStorageService } from '@cc/app/api/file-storage';
import { NotificationService } from '@cc/app/shared/services/notification';
import { DIALOG_CONFIG, DialogConfig } from '@cc/app/tokens';
import { BaseDialogResponseStatus } from '@cc/components/base-dialog';
import { BaseDialogService } from '@cc/components/base-dialog/services/base-dialog.service';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';

@Injectable()
export class UploadFileService {
    constructor(
        private notificationService: NotificationService,
        private baseDialogService: BaseDialogService,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig,
        private fileStorageService: FileStorageService,
        private http: HttpClient,
        private claimManagementService: ClaimManagementService
    ) {}

    upload(file: File, partyId: string, claimId: number, revision: number) {
        return this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Upload file' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === BaseDialogResponseStatus.Success),
                switchMap(() =>
                    this.fileStorageService.CreateNewFile(
                        new Map(),
                        moment().add(1, 'h').toISOString()
                    )
                ),
                switchMap((data) =>
                    this.http
                        .put(data.upload_url, file, {
                            headers: {
                                'Content-Disposition': [
                                    'attachment',
                                    `filename=${encodeURI(file.name)}`,
                                ].join(';'),
                                'Content-Type': '',
                            },
                        })
                        .pipe(map(() => data.file_data_id))
                ),
                switchMap((id) =>
                    this.claimManagementService.UpdateClaim(partyId, claimId, revision, [
                        {
                            claim_modification: {
                                file_modification: { id, modification: { creation: {} } },
                            },
                        },
                    ])
                )
            );
    }
}
