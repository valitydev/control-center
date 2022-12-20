import { Injectable } from '@angular/core';
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import { filter } from 'rxjs/operators';

import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';

@Injectable()
export class UploadFileService {
    constructor(private baseDialogService: BaseDialogService) {}

    upload(_file: File, _partyId: string, _claimId: number, _revision: number) {
        return this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Upload file' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === BaseDialogResponseStatus.Success)
                // TODO it's not available to bump https://github.com/valitydev/file-storage-proto to codegen v2 now.
                // switchMap(() =>
                //     this.fileStorageService.CreateNewFile(
                //         new Map(),
                //         moment().add(1, 'h').toISOString()
                //     )
                // ),
                // switchMap((data) =>
                //     this.http
                //         .put(data.upload_url, file, {
                //             headers: {
                //                 'Content-Disposition': [
                //                     'attachment',
                //                     `filename=${encodeURI(file.name)}`,
                //                 ].join(';'),
                //                 'Content-Type': '',
                //             },
                //         })
                //         .pipe(map(() => data.file_data_id))
                // ),
                // switchMap((id) =>
                //     this.claimManagementService.UpdateClaim(partyId, claimId, revision, [
                //         {
                //             claim_modification: {
                //                 file_modification: { id, modification: { creation: {} } },
                //             },
                //         },
                //     ])
                // )
            );
    }
}
