import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ThriftPipesModule } from '@cc/app/shared';

import { ComplexFormComponent } from './components/complex-form/complex-form.component';
import { EnumFieldComponent } from './components/enum-field/enum-field.component';
import { PrimitiveFieldComponent } from './components/primitive-field/primitive-field.component';
import { StructFormComponent } from './components/struct-form/struct-form.component';
import { TypedefFormComponent } from './components/typedef-form/typedef-form.component';
import { UnionFieldComponent } from './components/union-field/union-field.component';
import { MetadataFormComponent } from './metadata-form.component';

@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        GridModule,
        ThriftPipesModule,
        MatSelectModule,
        MatButtonModule,
        ReactiveFormsModule,
    ],
    declarations: [
        MetadataFormComponent,
        PrimitiveFieldComponent,
        ComplexFormComponent,
        StructFormComponent,
        UnionFieldComponent,
        TypedefFormComponent,
        EnumFieldComponent,
    ],
    exports: [MetadataFormComponent],
})
export class MetadataFormModule {}
