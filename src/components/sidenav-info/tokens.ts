import { InjectionToken, Type } from '@angular/core';

export type SidenavInfoComponents = Record<string, Type<unknown>>;
export const SIDENAV_INFO_COMPONENTS = new InjectionToken<SidenavInfoComponents>(
    'SIDENAV_INFO_COMPONENTS',
);
