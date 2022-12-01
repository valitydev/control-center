import { NgModule } from '@angular/core';

import { FistfulAdminService } from './fistful-admin.service';
import { FistfulStatisticsService } from './fistful-stat.service';

@NgModule({
    providers: [FistfulAdminService, FistfulStatisticsService],
})
export class FistfulModule {}
