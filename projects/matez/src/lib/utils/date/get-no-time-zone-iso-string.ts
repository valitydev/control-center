function getTimeZoneOffset(date: Date) {
    return date.getTimezoneOffset() * 60_000;
}

export function getNoTimeZoneIsoString(date?: Date | null): string {
    return date ? new Date(date.valueOf() - getTimeZoneOffset(date)).toISOString() : '';
}

export function createDateFromNoTimeZoneString(dateStr: string): Date {
    const date = new Date(dateStr);
    return new Date(date.valueOf() + getTimeZoneOffset(date));
}
