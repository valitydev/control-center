import { NgModule } from '@angular/core';

import { QueryParamsService } from './query-params.service';
import { DATE_QUERY_PARAMS_SERIALIZERS } from './utils/date-query-params-serializers';
import { QUERY_PARAMS_SERIALIZERS } from './utils/query-params-serializers';

@NgModule({
    providers: [
        { provide: QUERY_PARAMS_SERIALIZERS, useValue: DATE_QUERY_PARAMS_SERIALIZERS },
        QueryParamsService,
    ],
})
export class QueryParamsModule {}
