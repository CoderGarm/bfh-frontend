import {Component, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {AuthenticationService} from './services/authentication';
import {NavigationCreationService} from './services/navigation-creation.service';
import {interval} from "rxjs";
import {StarMapTabViewComponent} from "./modules/star-map/orga/star-map-tab-view/star-map-tab-view.component";
import {JournalTabViewComponent} from "./modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import {ChatComponent} from "./modules/chat/components/chat/chat.component";
import {ChatApiService} from "./services/swagger";
import {SubscriptionManager} from "./SubscriptionManager";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionManager implements OnInit {

    title: string = 'bfh-fe';

    routes: Routes = NavigationCreationService.createNavDrawerRoutes();

    isLoggedIn: boolean = false;

    hasUnread: boolean = false;

    activeRoute?: Route;

    isNoScroll: Boolean = false;
    private noScrollingPaths: string[] = [
        StarMapTabViewComponent.path,
        JournalTabViewComponent.path,
        ChatComponent.path
    ];

    constructor(private router: Router,
                private authenticationService: AuthenticationService,
                private chatApi: ChatApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.authenticationService.getAccessData().subscribe(loggedIn => this.isLoggedIn = !!loggedIn);
        this.subscriptions.push(sub);

        // detect unread at login ...
        this.detectUnreadMessages();

        const source = interval(2000);
        sub = source.subscribe(val => {
            // and later again repetitive
            this.detectUnreadMessages();
        });
        this.subscriptions.push(sub);
    }

    private detectUnreadMessages() {
        if (this.isLoggedIn) {
            const sub = this.chatApi.hasUserUnread().subscribe(resp => this.hasUnread = resp)
            this.subscriptions.push(sub);
        }
    }

    navigate(route?: Route) {
        if (!route) {
            route = NavigationCreationService.getLoginRoute();
        }
        this.activeRoute = route;
        this.router.navigateByUrl("/" + route.path).then(() => {
        });
        const path = this.activeRoute.path;
        this.isNoScroll = this.noScrollingPaths.includes(path!, 0);
    }

    isChat(path: string) {
        return path === ChatComponent.path;
    }
}
