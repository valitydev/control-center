export interface ErrorService {
    error: (error: unknown, message?: string) => void;
}
