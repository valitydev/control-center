import { Pipe, PipeTransform } from '@angular/core';

import { StatusColor } from '../../../../../styles/consts';

@Pipe({
    name: 'toPaymentColor',
    standalone: false,
})
export class ToPaymentColorPipe implements PipeTransform {
    transform(status: string): StatusColor {
        return getStatusColor(status);
    }
}

const getStatusColor = (status: string): StatusColor => {
    const s = status.toLowerCase();
    switch (s) {
        case 'processed':
        case 'captured':
            return StatusColor.Success;
        case 'pending':
        case 'charged_back':
            return StatusColor.Pending;
        case 'failed':
        case 'cancelled':
            return StatusColor.Warn;
        case 'refunded':
            return StatusColor.Neutral;
    }
    return undefined;
};
