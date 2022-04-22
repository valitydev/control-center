import { Patch } from './patch';

export interface Item extends Patch {
    isPatched: boolean;
}
