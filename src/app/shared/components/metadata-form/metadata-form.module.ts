import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { PipesModule } from '@vality/ng-core';

import { JsonViewerModule } from '@cc/app/shared/components/json-viewer';
import { ThriftPipesModule } from '@cc/app/shared/pipes/thrift';
import { ValueTypeTitleModule } from '@cc/app/shared/pipes/value-type-title';
import { CashModule } from '@cc/components/cash-field';

import { DatetimeComponent } from '../datetime';
import { ComplexFormComponent } from './components/complex-form/complex-form.component';
import { EnumFieldComponent } from './components/enum-field/enum-field.component';
import { ExtensionFieldComponent } from './components/extension-field/extension-field.component';
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
        PipesModule,
        CashModule,
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
        ExtensionFieldComponent,
    ],
    exports: [MetadataFormComponent],
})
export class MetadataFormModule {}
