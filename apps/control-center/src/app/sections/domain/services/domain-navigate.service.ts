import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class DomainNavigateService {
    private router = inject(Router);

    toType(type: string) {
        return this.router.navigate(['domain'], { queryParams: { types: JSON.stringify([type]) } });
    }
}
