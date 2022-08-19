import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AppConfig } from './types/app-config';

@Injectable()
export class ConfigService {
    config: AppConfig;

    constructor(private http: HttpClient) {}

    load(): Promise<void> {
        return new Promise((resolve) => {
            this.http.get<AppConfig>('assets/appConfig.json').subscribe((config) => {
                this.config = config;
                resolve(undefined);
            });
        });
    }
}
