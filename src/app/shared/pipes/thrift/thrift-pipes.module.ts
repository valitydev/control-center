import { NgModule } from '@angular/core';

import { KeyTitlePipe } from './key-title.pipe';
import { MapUnionPipe } from './map-union.pipe';
import { ThriftInt64Pipe } from './thrift-int64.pipe';
import { UnionKeyPipe } from './union-key.pipe';
import { UnionValuePipe } from './union-value.pipe';

const PIPES = [MapUnionPipe, ThriftInt64Pipe, UnionKeyPipe, KeyTitlePipe, UnionValuePipe];

@NgModule({
    declarations: PIPES,
    exports: PIPES,
})
export class ThriftPipesModule {}
