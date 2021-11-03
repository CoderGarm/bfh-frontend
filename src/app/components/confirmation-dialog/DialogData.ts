import {DialogDataPerTemplate} from "./dialog-data-per-template";


export class DialogData {

    cancelText: string = "cancel";
    confirmText: string = "confirm";
    title: string;

    dataPerTemplate: DialogDataPerTemplate<any, any>[] = [];

    constructor(title: string) {
        this.title = title;
    }

    addDialogDataPerTemplate(template: any,
                             injectorNames: string[],
                             payloads: any[]) {
        let dialogDataPerTemplate = new DialogDataPerTemplate(template, injectorNames, payloads);
        this.dataPerTemplate.push(dialogDataPerTemplate);
    }
}
