import { ProviderObject } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

export const filterProvidersByCategoryId = (
    objects: ProviderObject[],
    categoryId: number
): ProviderObject[] =>
    objects.filter((obj) => {
        const paymentCats = get(obj, 'data.payment_terms.categories.value', []);
        const recurrentCats = get(obj, 'data.recurrent_paytool_terms.categories.value', []);
        return !![...paymentCats, ...recurrentCats]
            .map((c) => c.id)
            .find((id) => id === categoryId);
    });
