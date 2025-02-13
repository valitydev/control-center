import { NgModule } from '@angular/core';

import { KeyTitlePipe } from './key-title.pipe';
import { MapUnionPipe } from './map-union.pipe';
import { UnionKeyPipe } from './union-key.pipe';
import { UnionValuePipe } from './union-value.pipe';
import { ValueTypeTitlePipe } from './value-type-title.pipe';

@NgModule({
    imports: [ValueTypeTitlePipe],
    declarations: [MapUnionPipe, UnionKeyPipe, KeyTitlePipe, UnionValuePipe],
    exports: [MapUnionPipe, UnionKeyPipe, KeyTitlePipe, UnionValuePipe, ValueTypeTitlePipe],
})
export class ThriftPipesModule {}
