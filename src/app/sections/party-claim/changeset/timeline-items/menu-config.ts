export enum MenuConfigAction {
    /* eslint-disable @typescript-eslint/naming-convention */
    editPartyModification = 'editPartyModification',
    deleteComment = 'deleteComment',
    deleteFile = 'deleteFile',
    removeUnsavedItem = 'removeUnsavedItem',
    /* eslint-enable @typescript-eslint/naming-convention */
}

export interface MenuConfigItem {
    action: MenuConfigAction;
    label: string;
    data?: any;
}
