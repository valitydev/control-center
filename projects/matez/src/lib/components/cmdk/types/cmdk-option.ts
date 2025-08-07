export interface CmdkOption {
    label: string;
    description?: string;
    tooltip?: string;
    icon?: string;
    url?: string;
    action?: () => void;
}
