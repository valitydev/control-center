export interface FetchAction<P = any> {
    type: 'search' | 'fetchMore';
    value?: P;
    size?: number;
}
