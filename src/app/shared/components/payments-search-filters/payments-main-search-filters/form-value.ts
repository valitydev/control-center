import { Moment } from 'moment';

export interface FormValue {
    fromTime: Moment;
    toTime: Moment;
    invoiceIDs?: string;
    shopIDs?: string[];
    bin?: string;
    pan?: string;
    rrn?: string;
}
