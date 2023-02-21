import {Component} from "@angular/core";
import {ResourceEmitterService} from "../../../../services/resource-emitter.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {AppInjector} from "../../../../app.module";

@Component({
    template: ''
})
export class ResourceDisplayManager extends SubscriptionManager {

    private resourceEmitterService = AppInjector.get(ResourceEmitterService);

    constructor() {
        super();
    }

    ngOnDestroy() {
        this.resourceEmitterService.closeDialog();
        super.ngOnDestroy();
    }
}
