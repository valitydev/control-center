import { TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { Color } from '../../../styles';

interface Action {
    icon: string;
    click?: (event: MouseEvent) => void;
}

interface Click {
    click?: (event: MouseEvent) => void;
    link?: (event: MouseEvent) => string | Parameters<Router['navigate']>;
}

export interface BaseValue<V = unknown> extends Click {
    value?: V;

    description?: string | number | boolean;
    tooltip?: string;
    color?: Color;

    template?: TemplateRef<unknown>;

    inProgress?: boolean;

    prefix?: Action;
    postfix?: Action;
}

export type TypedValue<T, V = unknown> = BaseValue<V> & { type: T };
export type TypedParamsValue<T, P extends object = Record<never, never>, V = unknown> = TypedValue<
    T,
    V
> &
    (keyof P extends never ? { params?: P } : { params: P });
