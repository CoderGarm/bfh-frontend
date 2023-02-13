import {Component, Input} from '@angular/core';
import {Route, Routes} from "@angular/router";
import {NavigationCommunicationService} from "../../services/navigation/navigation-communication.service";
import {SubscriptionManager} from "../../subscription.manager";

@Component({
    selector: 'app-nested-sidenav',
    templateUrl: './nested-sidenav.component.html',
    styleUrls: ['./nested-sidenav.component.scss']
})
export class NestedSidenavComponent extends SubscriptionManager {

    @Input()
    afterLoginPath: string = '';

    @Input()
    isLoggedIn: boolean = false;

    @Input()
    routes: Routes = [];

    @Input()
    hasUnread: string[] = [];

    constructor(protected navService: NavigationCommunicationService) {
        super();
    }

    navigate(route: Route) {
        this.navService.navigate(route);
    }

    isSelected(path: string) {
        return this.navService.activeRoute?.path === path;
    }
}
