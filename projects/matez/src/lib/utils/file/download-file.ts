interface FileType {
    type: string;
    format: string;
}

const FILE_TYPES = {
    csv: {
        type: 'text/csv',
        format: 'csv',
    },
} satisfies Record<string, FileType>;

export function downloadFile(
    data: string,
    type: keyof typeof FILE_TYPES,
    filename: string = 'data',
): void {
    const blob = new Blob([data], { type: FILE_TYPES[type].type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${FILE_TYPES[type].format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
