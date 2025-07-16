import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { observableResource } from '@vality/matez';

import { environment } from '../../environments/environment';

import { AppConfig } from './types/app-config';

@Injectable()
export class ConfigService {
    private http = inject(HttpClient);

    config = observableResource({
        loader: () => this.http.get<AppConfig>(environment.appConfigPath),
    });
}
