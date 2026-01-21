import { services } from '~/api/services';

export const Services = services.reduce(
    (acc, service) => {
        acc[service.name] = service.name;
        return acc;
    },
    {} as Record<(typeof services)[number]['name'], (typeof services)[number]['name']>,
);

export type Service = (typeof services)[number]['name'];
