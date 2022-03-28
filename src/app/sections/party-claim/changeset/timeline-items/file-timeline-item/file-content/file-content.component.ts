import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileID } from '@vality/domain-proto/lib/claim_management';
import { FileData } from '@vality/file-storage-proto';

import { FileTimelineItemService } from '../file-timeline-item.service';

@Component({
    selector: 'cc-file-content',
    templateUrl: 'file-content.component.html',
    styleUrls: ['file-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileContentComponent {
    @Input()
    fileData: FileData;

    constructor(private fileTimelineItemService: FileTimelineItemService) {}

    downloadFile(fileID: FileID) {
        this.fileTimelineItemService.downloadFile(fileID);
    }
}
