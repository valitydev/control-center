import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GridModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ThriftPipesModule } from '@cc/app/shared';
import { ComplexFieldComponent } from '@cc/app/shared/components/metadata-form/components/complex-field/complex-field.component';
import { ObjectFormComponent } from '@cc/app/shared/components/metadata-form/components/object-form/object-form.component';
import { PrimitiveFieldComponent } from '@cc/app/shared/components/metadata-form/components/primitive-field/primitive-field.component';
import { StructFieldComponent } from '@cc/app/shared/components/metadata-form/components/struct-field/struct-field.component';
import { UnionFieldComponent } from '@cc/app/shared/components/metadata-form/components/union-field/union-field.component';

import { MetadataFormComponent } from './metadata-form.component';

@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        GridModule,
        ThriftPipesModule,
        MatSelectModule,
        MatButtonModule,
    ],
    declarations: [
        MetadataFormComponent,
        PrimitiveFieldComponent,
        ComplexFieldComponent,
        StructFieldComponent,
        UnionFieldComponent,
        ObjectFormComponent,
    ],
    exports: [MetadataFormComponent],
})
export class MetadataFormModule {}
