import { InjectionToken } from '@angular/core';

import { Serializer } from '../types/serializer';

export const QUERY_PARAMS_SERIALIZERS = new InjectionToken<Serializer[]>(
    'query params serializers',
);
