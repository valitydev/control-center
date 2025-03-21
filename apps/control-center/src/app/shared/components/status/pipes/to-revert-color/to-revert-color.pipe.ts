import { Pipe, PipeTransform } from '@angular/core';

import { StatusColor } from '../../../../../styles/consts';

@Pipe({
    name: 'toRevertColor',
    standalone: false,
})
export class ToRevertColorPipe implements PipeTransform {
    transform(status: string): StatusColor {
        return getStatusColor(status);
    }
}

const getStatusColor = (status: string): StatusColor => {
    const s = status.toLowerCase();
    switch (s) {
        case 'succeeded':
            return StatusColor.Success;
        case 'pending':
            return StatusColor.Pending;
        case 'failed':
            return StatusColor.Warn;
        default:
            return StatusColor.Neutral;
    }
};
