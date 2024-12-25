import { TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { Color } from '../../../styles';

export type BaseValue<V = unknown> = {
    value?: V;

    description?: string | number | boolean;
    tooltip?: string;
    color?: Color;

    click?: (event: MouseEvent) => void;
    link?: (event: MouseEvent) => string | Parameters<Router['navigate']>;

    template?: TemplateRef<unknown>;

    inProgress?: boolean;
};

export type TypedValue<T, V = unknown> = BaseValue<V> & { type: T };
export type TypedParamsValue<T, P extends object, V = unknown> = TypedValue<T, V> & { params: P };
