import { lastValueFrom } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable()
export class ConfigServiceSuperclass<T> {
    private http = inject(HttpClient);
    config!: T;

    async init({ configUrl }: { configUrl: string }): Promise<void> {
        this.config = await lastValueFrom(this.http.get<T>(configUrl));
    }
}
