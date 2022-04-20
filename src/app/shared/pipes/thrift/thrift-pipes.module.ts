import { NgModule } from '@angular/core';

import { KeyTitlePipe } from '@cc/app/shared/pipes/thrift/key-title.pipe';

import { ClaimStatusThriftPipe } from './claim-status-thrift.pipe';
import { MapUnionPipe } from './map-union.pipe';
import { ThriftInt64Pipe } from './thrift-int64.pipe';
import { ThriftViewPipe } from './thrift-view.pipe';
import { UnionKeyPipe } from './union-key';

const PIPES = [
    ClaimStatusThriftPipe,
    MapUnionPipe,
    ThriftInt64Pipe,
    ThriftViewPipe,
    UnionKeyPipe,
    KeyTitlePipe,
];

@NgModule({
    declarations: PIPES,
    exports: PIPES,
})
export class ThriftPipesModule {}
