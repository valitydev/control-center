// eslint-disable-next-line @typescript-eslint/naming-convention
export function DebounceTime(ms: number = 500) {
    return function (target: object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
        let timer: number | null = null;
        const method = descriptor.value;

        descriptor.value = function () {
            if (timer !== null) {
                window.clearTimeout(timer);
            }
            timer = window.setTimeout(() => {
                // eslint-disable-next-line prefer-rest-params
                method.apply(this, arguments);
                timer = null;
            }, ms);
        };
    };
}
