// export const isDominantSecretRole = (keycloakRoles: string[], secretRole: string): boolean =>
//     !isNil(keycloakRoles.find((role) => role === secretRole)) || !environment.production;

export const isDominantSecretRole = (_keycloakRoles: string[], _secretRole: string): boolean =>
    true;
