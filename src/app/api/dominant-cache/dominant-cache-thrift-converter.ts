import partial from 'lodash-es/partial';

import metadata from '../../../assets/api-meta/dominant-cache.json';
import {
    createThriftInstanceUtils,
    ThriftAstMetadata,
    thriftInstanceToObject,
} from '../../thrift-services';
import * as dominant_cache from './dominant-cache/gen-nodejs/dominant_cache_types';

export const {
    createThriftInstance: createDominantCacheInstance,
    thriftInstanceToObject: dominantCacheInstanceToObject,
} = createThriftInstanceUtils(metadata, {
    dominant_cache,
});

export const toPlainObjectDominantCache = partial(
    thriftInstanceToObject,
    (metadata as unknown) as ThriftAstMetadata[],
    'dominant_cache'
);
