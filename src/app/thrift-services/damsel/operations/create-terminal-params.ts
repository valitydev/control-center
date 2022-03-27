import { RiskScore } from '@vality/domain-proto/lib/domain';

export class TerminalOption {
    key: string;
    value: string;
}

export class CreateTerminalParams {
    terminalName: string;
    terminalDescription: string;
    riskCoverage: RiskScore;
    options: TerminalOption[];
}
