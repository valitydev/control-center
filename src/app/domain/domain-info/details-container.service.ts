import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Subject } from 'rxjs';

@Injectable()
export class DetailsContainerService {
    opened$: Subject<boolean> = new Subject();

    private detailsContainer: MatSidenav;

    set container(sidenav: MatSidenav) {
        this.detailsContainer = sidenav;
        this.detailsContainer.openedChange.subscribe((opened) => this.opened$.next(opened));
    }

    open() {
        void this.detailsContainer.open();
    }

    close() {
        void this.detailsContainer.close();
    }
}
