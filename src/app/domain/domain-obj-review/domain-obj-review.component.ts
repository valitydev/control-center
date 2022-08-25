import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';

import { DomainObjModificationService } from '../services/domain-obj-modification.service';
import { ModifiedDomainObjectService } from '../services/modified-domain-object.service';

@Component({
    templateUrl: './domain-obj-review.component.html',
    styleUrls: ['../editor-container.scss'],
    providers: [DomainObjModificationService],
})
export class DomainObjReviewComponent {
    control = new FormControl();

    progress$ = this.domainObjModService.progress$;
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    object$ = this.domainObjModService.object$;
    type$ = this.domainObjModService.type$;
    modifiedObject = this.modifiedDomainObjectService.domainObject;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private domainObjModService: DomainObjModificationService,
        private modifiedDomainObjectService: ModifiedDomainObjectService
    ) {
        if (!modifiedDomainObjectService.domainObject) {
            this.back();
        }
    }

    commit() {}

    back() {
        void this.router.navigate(['domain', 'edit', this.route.snapshot.params.ref]);
    }
}
