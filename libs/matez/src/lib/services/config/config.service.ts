import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ConfigServiceSuperclass<T> {
    config!: T;

    constructor(private http: HttpClient) {}

    async init({ configUrl }: { configUrl: string }): Promise<void> {
        this.config = await lastValueFrom(this.http.get<T>(configUrl));
    }
}
