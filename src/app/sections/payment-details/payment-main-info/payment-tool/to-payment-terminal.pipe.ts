import { Pipe, PipeTransform } from '@angular/core';
import { TerminalPaymentProvider } from '@vality/domain-proto/lib/merch_stat';

@Pipe({
    name: 'toPaymentTerminal',
})
export class ToPaymentTerminalPipe implements PipeTransform {
    transform(terminalType: TerminalPaymentProvider): string {
        return toPaymentTerminal(terminalType);
    }
}

export const toPaymentTerminal = (terminalType: TerminalPaymentProvider): string => {
    switch (terminalType) {
        case TerminalPaymentProvider.euroset:
            return 'Евросеть';
        case TerminalPaymentProvider.wechat:
            return 'WeChat';
        case TerminalPaymentProvider.alipay:
            return 'AliPay';
        case TerminalPaymentProvider.zotapay:
            return 'ZotaPay';
        case TerminalPaymentProvider.qps:
            return 'QPS';
    }
};
