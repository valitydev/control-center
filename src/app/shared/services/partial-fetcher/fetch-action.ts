export interface FetchAction<P = unknown> {
    type: 'search' | 'fetchMore';
    value?: P;
    size?: number;
}
