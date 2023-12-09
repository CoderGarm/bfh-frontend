import {DialogDataPerTemplate} from "./dialog-data-per-template";


export class DialogData {

    cancelText: string = "cancel";
    confirmText: string = "confirm";
    title: string;
    bodyText?: string;
    bodyText2?: string;

    dataPerTemplate: DialogDataPerTemplate<any, any>[] = [];

    constructor(title: string, bodyText?: string, bodyText2?: string) {
        this.title = title;
        this.bodyText2 = bodyText2;
    }

    addDialogDataPerTemplate(template: any,
                             injectorNames: string[],
                             payloads: any[]) {
        let dialogDataPerTemplate = new DialogDataPerTemplate(template, injectorNames, payloads);
        this.dataPerTemplate.push(dialogDataPerTemplate);
    }
}
