export interface FetchAction<P = any> {
    type: 'search' | 'fetchMore';
    value?: P;
}
