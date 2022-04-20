import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GridModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { ThriftPipesModule } from '@cc/app/shared';
import { DetailsItemModule } from '@cc/components/details-item';

import { JsonViewerComponent } from './json-viewer.component';

@NgModule({
    declarations: [JsonViewerComponent],
    exports: [JsonViewerComponent],
    imports: [
        CommonModule,
        MatDividerModule,
        DetailsItemModule,
        GridModule,
        MatCardModule,
        ThriftPipesModule,
    ],
})
export class JsonViewerModule {}
