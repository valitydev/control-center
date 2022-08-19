import { ContentObserver } from '@angular/cdk/observers';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { defer, ReplaySubject, switchMap } from 'rxjs';
import { delay, distinctUntilChanged, map, share, startWith } from 'rxjs/operators';

@Component({
    selector: 'cc-details-item',
    templateUrl: 'details-item.component.html',
    styleUrls: ['details-item.component.scss'],
})
export class DetailsItemComponent implements AfterViewInit {
    @Input() title: string;

    @ViewChild('content') contentElementRef: ElementRef<HTMLElement>;

    isEmpty$ = defer(() => this.viewInit$).pipe(
        switchMap(() =>
            this.contentObserver.observe(this.contentElementRef.nativeElement).pipe(startWith(null))
        ),
        map(() => this.getIsEmpty()),
        distinctUntilChanged(),
        delay(0),
        share()
    );

    private viewInit$ = new ReplaySubject<void>(1);

    constructor(private contentObserver: ContentObserver) {}

    ngAfterViewInit() {
        this.viewInit$.next();
    }

    private getIsEmpty() {
        return !Array.from(this.contentElementRef.nativeElement.childNodes).find(
            (n) =>
                n.nodeType !== Node.COMMENT_NODE ||
                (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim())
        );
    }
}
