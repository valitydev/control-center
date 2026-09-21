export function isOrganizationNotFoundError(error: unknown): boolean {
    return (
        (error as { error?: { name?: string }; name?: string })?.error?.name ===
            'OrganizationNotFound' ||
        (error as { error?: { name?: string }; name?: string })?.name === 'OrganizationNotFound'
    );
}
