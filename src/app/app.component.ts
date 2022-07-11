import {Component, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {AuthenticationService} from './services/authentication';
import {NavigationCreationService} from './services/navigation-creation.service';
import {Subscription} from "rxjs";
import {StarMapTabViewComponent} from "./modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {JournalTabViewComponent} from "./modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import {ChatComponent} from "./modules/chat/components/chat/chat.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title: string = 'bfh-fe';

    private subscription?: Subscription;

    routes: Routes = NavigationCreationService.createNavDrawerRoutes();

    isLoggedIn: boolean = false;

    activeRoute?: Route;

    isNoScroll: Boolean = false;
    private noScrollingPaths: string[] = [
        StarMapTabViewComponent.path,
        JournalTabViewComponent.path,
        ChatComponent.path
    ];

    constructor(private router: Router, private authenticationService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.subscription = this.authenticationService.getAccessData().subscribe(loggedIn => this.isLoggedIn = !!loggedIn);
    }

    navigate(route?: Route) {
        if (!route) {
            route = NavigationCreationService.getLoginRoute();
        }
        this.activeRoute = route;
        this.router.navigateByUrl("/" + route.path);
        const path = this.activeRoute.path;
        this.isNoScroll = this.noScrollingPaths.includes(path!, 0);
    }

    ngOnDestroy() {
        if (!!this.subscription) {
            this.subscription.unsubscribe()
        }
    }
}
