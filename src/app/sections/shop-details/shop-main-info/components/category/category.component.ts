import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Category } from '@vality/domain-proto/lib/domain';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DominantCacheService } from '@cc/app/api/dominant-cache';

@Component({
    templateUrl: 'category.component.html',
    selector: 'cc-category',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
    @Input() set category(categoryID: number) {
        this.categoryID = categoryID;
        this.category$ = this.dominantCacheService
            .GetCategories()
            .pipe(
                map((categories) =>
                    categories.find((category) => category.ref === String(categoryID))
                )
            );
    }

    category$: Observable<Category>;
    categoryID: number;

    constructor(private dominantCacheService: DominantCacheService) {}
}
