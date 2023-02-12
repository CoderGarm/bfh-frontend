import {Injectable} from "@angular/core";
import {Route} from "@angular/router";
import {ReplaySubject} from "rxjs";


@Injectable()
export class NavigationCommunicationService {

    activeRoute?: Route;

    /**
     * communicates a click on a route in the sidenav
     */
    private navigationEmitter: ReplaySubject<Route> = new ReplaySubject<Route>();

    getNavigationEmitter(): ReplaySubject<Route> {
        return this.navigationEmitter;
    }

    navigate(route: Route) {
        if (!!this.activeRoute && this.activeRoute.path === route.path) {
            return;
        }
        this.navigationEmitter.next(route);
    }
}
