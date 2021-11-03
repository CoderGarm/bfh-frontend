import {Injector} from "@angular/core";

export class DialogDataPerTemplate<Template, Payload> {

    template: Template;

    payloads: Payload[];

    injectorNames: string[];

    injector?: Injector;

    constructor(template: Template,
                injectorNames: string[],
                payloads: Payload[]) {
        this.template = template;
        this.injectorNames = injectorNames;
        this.payloads = payloads;
    }
}
