import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DatetimeComponent } from '@cc/app/shared/components/datetime/datetime.component';
import { JsonViewerModule } from '@cc/app/shared/components/json-viewer';
import { ThriftPipesModule } from '@cc/app/shared/pipes/thrift';
import { ValueTypeTitleModule } from '@cc/app/shared/pipes/value-type-title';

import { ComplexFormComponent } from './components/complex-form/complex-form.component';
import { EnumFieldComponent } from './components/enum-field/enum-field.component';
import { LabelComponent } from './components/label/label.component';
import { PrimitiveFieldComponent } from './components/primitive-field/primitive-field.component';
import { StructFormComponent } from './components/struct-form/struct-form.component';
import { TypedefFormComponent } from './components/typedef-form/typedef-form.component';
import { UnionFieldComponent } from './components/union-field/union-field.component';
import { MetadataFormComponent } from './metadata-form.component';
import { FieldLabelPipe } from './pipes/field-label.pipe';

@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        GridModule,
        ThriftPipesModule,
        MatSelectModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatTooltipModule,
        MatIconModule,
        JsonViewerModule,
        OverlayModule,
        MatCardModule,
        MatExpansionModule,
        FlexModule,
        ValueTypeTitleModule,
        MatCheckboxModule,
        MatChipsModule,
        MatRadioModule,
        MatDatepickerModule,
        DatetimeComponent,
    ],
    declarations: [
        MetadataFormComponent,
        PrimitiveFieldComponent,
        ComplexFormComponent,
        StructFormComponent,
        UnionFieldComponent,
        TypedefFormComponent,
        EnumFieldComponent,
        LabelComponent,
        FieldLabelPipe,
    ],
    exports: [MetadataFormComponent],
})
export class MetadataFormModule {}
