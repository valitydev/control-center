export const ROLE_PRIORITY: Record<string, number> = {
    Administrator: 1,
    Manager: 2,
    Accountant: 3,
    Integrator: 4,
    WalletManager: 5,
};

export function sortRoleIds(roleIds: string[]): string[] {
    return [...roleIds].sort((a, b) => {
        const priorityA = ROLE_PRIORITY[a] ?? 100;
        const priorityB = ROLE_PRIORITY[b] ?? 100;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return a.localeCompare(b);
    });
}
