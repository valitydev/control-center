import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThriftViewerModule } from '@vality/ng-thrift';

import { ThriftViewerBaseComponent } from './thrift-viewer-superclass.directive';

@NgModule({
    imports: [CommonModule, ThriftViewerModule],
    declarations: [ThriftViewerBaseComponent],
    exports: [ThriftViewerBaseComponent],
})
export class ThriftViewerBaseModule {}
