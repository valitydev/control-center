import { environment } from '../../../../environments/environment';

export const isRolesAllowed = (
    availableRoles: string[],
    searchRoles: string[],
    isEnvProd = environment.production
): boolean => {
    if (!isEnvProd) return true;
    return (searchRoles || []).every((r) => (availableRoles || []).includes(r));
};
