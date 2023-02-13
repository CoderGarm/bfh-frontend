import {Component, Inject} from "@angular/core";
import {SubscriptionManager} from "./subscription.manager";
import {Route} from "@angular/router";
import {AppInjector} from "./app.module";
import {NavigationCommunicationService} from "./services/navigation/navigation-communication.service";
import {AbstractId} from "./services/swagger";

@Component({
    template: ''
})
export class SidenavSelectionManager extends SubscriptionManager {

    route: Route;

    selectedItem?: AbstractId;

    navService = AppInjector.get(NavigationCommunicationService);

    constructor(@Inject('route') route: Route) {
        super();

        this.route = route;
        let sub = this.navService.getNavigationEmitter()
            .subscribe(route => {
                if (route.path != this.route.path) {
                    this.selectedItem = undefined;
                }
            });
        this.subscriptions.push(sub);
    }

    isSelected(identifier: number) {
        return this.selectedItem?.id === identifier;
    }
}