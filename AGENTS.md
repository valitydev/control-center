## 1. Thrift API

- Services are registered in `src/api/services.ts` and exported via `injectableServices`.
- Inject `Thrift...Service` directly via `inject(Thrift...Service)`. Do not create intermediate wrapper services.

## 2. UI & Shared Libraries

- Use `@vality/matez` (`projects/matez/`) for shared UI components (`TableModule`, `PageLayoutModule`, `SelectFieldModule`, `DialogModule`, etc.).

## 3. Signal Forms (`@angular/forms/signals`)

- **Custom Controls**: Implement `FormValueControl<T>` with `value = model<T>()` and `control = form(this.value)`. Do not use `FormControlSuperclass` or `ControlValueAccessor`.

## 4. Observable Resource (`@vality/matez`)

- Use `observableResource` for async data fetching instead of manual Observable pipelines with `reload$` subjects, `inProgress$`, and `shareReplay`.
- Access data and loading state via signals: `resource.value()`, `resource.isLoading()`, and reload using `resource.reload()`.
- For tables, use `<v-table-resource [columns]="columns" [resource]="resource" />`.
- For select fields and other controls, bind signals directly: `[options]="resource.value()"` and `[progress]="resource.isLoading()"`.
