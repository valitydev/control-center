import { isOrganizationNotFoundError } from './is-organization-not-found-error';

describe('isOrganizationNotFoundError', () => {
    it('should return true for ThriftServiceError containing OrganizationNotFound', () => {
        const error = {
            name: 'ThriftServiceError',
            error: {
                name: 'OrganizationNotFound',
            },
        };
        expect(isOrganizationNotFoundError(error)).toBe(true);
    });

    it('should return true if error.name is OrganizationNotFound', () => {
        const error = {
            name: 'OrganizationNotFound',
        };
        expect(isOrganizationNotFoundError(error)).toBe(true);
    });

    it('should return false for other Thrift errors', () => {
        const error = {
            name: 'ThriftServiceError',
            error: {
                name: 'PartyAlreadyBound',
            },
        };
        expect(isOrganizationNotFoundError(error)).toBe(false);
    });

    it('should return false for network and timeout errors', () => {
        expect(
            isOrganizationNotFoundError({
                name: 'ThriftServiceTimeoutError',
            }),
        ).toBe(false);

        expect(isOrganizationNotFoundError(new Error('Network error'))).toBe(false);
    });

    it('should return false for null and undefined', () => {
        expect(isOrganizationNotFoundError(null)).toBe(false);
        expect(isOrganizationNotFoundError(undefined)).toBe(false);
    });
});
