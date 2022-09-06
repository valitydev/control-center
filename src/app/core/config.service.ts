import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AppConfig } from './types/app-config';

@Injectable()
export class ConfigService {
    config: AppConfig;

    constructor(private http: HttpClient) {}

    load(): Promise<void> {
        return new Promise((resolve) => {
            this.http.get<AppConfig>(environment.appConfigPath).subscribe((config) => {
                this.config = config;
                resolve(undefined);
            });
        });
    }
}
