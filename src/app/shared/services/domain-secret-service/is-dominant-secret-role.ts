import isNil from 'lodash-es/isNil';

import { environment } from '@cc/environments/environment';

export const isDominantSecretRole = (keycloakRoles: string[], secretRole: string): boolean =>
    !isNil(keycloakRoles.find((role) => role === secretRole)) || !environment.production;
