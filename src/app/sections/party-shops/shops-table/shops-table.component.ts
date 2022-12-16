import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import { Shop } from '@vality/domain-proto/lib/domain';
import { pluck } from 'rxjs/operators';

@Component({
    selector: 'cc-shops-table',
    templateUrl: 'shops-table.component.html',
    styleUrls: ['shops-table.component.scss'],
})
export class ShopsTableComponent implements OnChanges {
    @Input() shops: Shop[];
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    dataSource: MatTableDataSource<Shop> = new MatTableDataSource();
    displayedColumns = ['id', 'name', 'url', 'actions'];

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnChanges({ shops }: SimpleChanges) {
        if (shops.currentValue) {
            this.dataSource.data = shops.currentValue;
            this.dataSource.filterPredicate = (shop: Shop, filter: string) =>
                JSON.stringify(shop).toLowerCase().includes(filter);
            this.dataSource.paginator = this.paginator;
        }
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    navigateToShop(shopID: string) {
        this.route.params.pipe(pluck('partyID')).subscribe((partyID: string) => {
            void this.router.navigate([`/party/${partyID}/shop/${shopID}`]);
        });
    }
}
