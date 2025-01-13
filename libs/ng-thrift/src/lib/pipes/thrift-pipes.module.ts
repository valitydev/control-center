import { NgModule } from '@angular/core';

import { KeyTitlePipe } from './key-title.pipe';
import { MapUnionPipe } from './map-union.pipe';
import { UnionKeyPipe } from './union-key.pipe';
import { UnionValuePipe } from './union-value.pipe';

const PIPES = [MapUnionPipe, UnionKeyPipe, KeyTitlePipe, UnionValuePipe];

@NgModule({
    declarations: PIPES,
    exports: PIPES,
})
export class ThriftPipesModule {}
