import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { UrlService } from '@vality/matez';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { MerchantFieldModule } from '../../../shared/components/merchant-field';
import { KeycloakUserService } from '../../../shared/services';

@Component({
    selector: 'cc-toolbar',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        CommonModule,
        MerchantFieldModule,
        FormsModule,
        ReactiveFormsModule,
        CdkCopyToClipboard,
        RouterModule,
    ],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent implements OnInit {
    private keycloakUserService = inject(KeycloakUserService);
    private router = inject(Router);
    private urlService = inject(UrlService);
    private destroyRef = inject(DestroyRef);
    private snackBar = inject(MatSnackBar);
    user = this.keycloakUserService.user.value;
    partyIdControl = new FormControl<string>(this.getPartyId());
    hasMenu$ = this.urlService.path$.pipe(map((p) => p.length <= 3));

    ngOnInit() {
        this.partyIdControl.valueChanges
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((partyId) => {
                const currentPartyId = this.getPartyId() || null;
                if (partyId) {
                    if (currentPartyId !== partyId) {
                        void this.router.navigate([`/party/${partyId}`]);
                    }
                } else if (currentPartyId) {
                    void this.router.navigate([`/parties`]);
                }
            });
        this.urlService.path$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((path) => {
            const partyId = this.getPartyId(path) || null;
            if (partyId !== this.partyIdControl.value) {
                this.partyIdControl.setValue(partyId);
            }
        });
    }

    logout() {
        void this.keycloakUserService.logout();
    }

    copyNotify(res: boolean) {
        this.snackBar.open(
            res
                ? `Party Id #${this.partyIdControl.value} copied`
                : `Party Id not copied, select and copy yourself: ${this.partyIdControl.value}`,
            'OK',
            { duration: res ? 2_000 : 60_000 },
        );
    }

    toParty() {
        void this.router.navigate([`/party/${this.partyIdControl.value}`]);
    }

    private getPartyId(path: string[] = this.urlService.path) {
        return path[0] === 'party' && path[1] ? path[1] : null;
    }
}
