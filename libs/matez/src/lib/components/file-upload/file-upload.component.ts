import { Component, EventEmitter, Input, Output } from '@angular/core';

import { NotifyLogService } from '../../services';

function hasExtension(fileName: string, extensions: string[]) {
    return (
        !extensions?.length ||
        new RegExp('(' + extensions.join('|').replace(/\./g, '\\.') + ')$').test(fileName)
    );
}

@Component({
    selector: 'v-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    standalone: false,
})
export class FileUploadComponent {
    @Input() label?: string;
    @Input() extensions: string[] = [];

    @Output() upload = new EventEmitter<File | null>();

    protected file?: File | null;

    constructor(private log: NotifyLogService) {}

    loadFile(event: Event) {
        const file = (event.target as HTMLInputElement)?.files?.[0] ?? null;
        if (!file) {
            this.log.error(new Error('File upload error'));
            return;
        }
        if (!hasExtension(file.name, this.extensions)) {
            this.log.error(new Error(`Supported file types: ${this.extensions.join(', ')}`));
            return;
        }
        this.file = file;
        this.upload.emit(this.file);
    }
}
