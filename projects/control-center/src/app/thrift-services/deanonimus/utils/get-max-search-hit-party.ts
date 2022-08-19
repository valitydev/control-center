import { Party, SearchHit } from '@vality/deanonimus-proto';
import maxBy from 'lodash-es/maxBy';

export const getMaxSearchHitParty = (searchHits: SearchHit[]): Party =>
    maxBy(searchHits, (searchHit) => searchHit.score)?.party;
