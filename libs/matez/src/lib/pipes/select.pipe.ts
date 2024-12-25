import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { isObservable, Observable } from 'rxjs';

import { select, SelectFn } from '../utils';

@Pipe({
    standalone: true,
    name: 'vSelect',
    pure: false,
})
export class VSelectPipe<TObject extends object, TResult, TParams extends Array<unknown> = []>
    implements PipeTransform, OnDestroy
{
    private asyncPipe?: AsyncPipe;

    constructor(private ref: ChangeDetectorRef) {}

    transform(
        obj: TObject,
        selectFn: SelectFn<TObject, TResult, TParams>,
        defaultValue?: TResult,
        rest: TParams[] = [],
    ): TResult | null {
        const res = obj && selectFn ? select(obj, selectFn, defaultValue, rest) : null;
        if (isObservable(res) && !this.asyncPipe) {
            this.asyncPipe = new AsyncPipe(this.ref);
        }
        if (this.asyncPipe) {
            return this.asyncPipe.transform(res as Observable<TResult>);
        }
        return res as TResult;
    }

    ngOnDestroy() {
        this.asyncPipe?.ngOnDestroy?.();
    }
}
