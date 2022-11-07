import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThriftPipesModule } from '@cc/app/shared';
import { DetailsItemModule } from '@cc/components/details-item';

import { JsonViewerComponent } from './json-viewer.component';
import { KeyComponent } from './components/key/key.component';

@NgModule({
    declarations: [JsonViewerComponent, KeyComponent],
    exports: [JsonViewerComponent],
    imports: [
        CommonModule,
        MatDividerModule,
        DetailsItemModule,
        GridModule,
        MatCardModule,
        ThriftPipesModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        FlexModule,
    ],
})
export class JsonViewerModule {}
