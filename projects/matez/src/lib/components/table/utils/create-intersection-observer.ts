import { Observable } from 'rxjs';

export function createIntersectionObserver(el: HTMLElement) {
    return new Observable<IntersectionObserverEntry>((subscriber) => {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    subscriber.next(entry);
                }
            }
        });
        observer.observe(el);
        return {
            unsubscribe() {
                observer.disconnect();
            },
        };
    });
}
