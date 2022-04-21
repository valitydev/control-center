import { NgModule } from '@angular/core';

import { ClaimStatusThriftPipe } from './claim-status-thrift.pipe';
import { KeyTitlePipe } from './key-title.pipe';
import { MapUnionPipe } from './map-union.pipe';
import { ThriftInt64Pipe } from './thrift-int64.pipe';
import { ThriftViewPipe } from './thrift-view.pipe';
import { UnionKeyPipe } from './union-key.pipe';
import { UnionValuePipe } from './union-value.pipe';

const PIPES = [
    ClaimStatusThriftPipe,
    MapUnionPipe,
    ThriftInt64Pipe,
    ThriftViewPipe,
    UnionKeyPipe,
    KeyTitlePipe,
    UnionValuePipe,
];

@NgModule({
    declarations: PIPES,
    exports: PIPES,
})
export class ThriftPipesModule {}
