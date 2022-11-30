import { NgModule } from '@angular/core';

import { FistfulAdminService } from './fistful-admin.service';
import { FistfulStatisticsService } from './fistful-stat.service';
import { RepairerService } from './repairer.service';

@NgModule({
    providers: [RepairerService, FistfulAdminService, FistfulStatisticsService],
})
export class FistfulModule {}
