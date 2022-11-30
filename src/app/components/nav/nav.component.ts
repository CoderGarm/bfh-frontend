import {AuthenticationService} from '../../services/authentication';
import {Component, HostListener, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {TokenStorage} from "../../services/authentication/token-storage.service";
import {AdminApiService, ApplicationInfo, JWT, Tick, TickApiService} from "../../services/swagger";
import {SubscriptionManager} from "../../SubscriptionManager";
import {NavigationCreationService} from "../../services/navigation-creation.service";
import {JournalTabViewComponent} from "../../modules/journal/components/orga/journal-tab-view/journal-tab-view.component";
import RoleEnum = JWT.RoleEnum;


@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent extends SubscriptionManager implements OnInit {

    routes: Routes = NavigationCreationService.createBurgerMenuRoutes();

    isLoggedIn: boolean = false;
    isAdmin: boolean = false;

    applicationInfo?: ApplicationInfo;

    currentTick?: Tick;

    activeRoute?: Route;

    constructor(private router: Router,
                private authenticationService: AuthenticationService,
                private tokenStorage: TokenStorage,
                private tickApi: TickApiService,
                private adminApi: AdminApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.authenticationService.getAccessData().subscribe(jwt => {
            this.isLoggedIn = !!jwt;
            if (this.isLoggedIn && !this.tokenStorage.getInterruptedURL()) {
                this.isAdmin = jwt.role === RoleEnum.ADMIN;
                const url = JournalTabViewComponent.path;
                this.router.navigateByUrl(url).then(() => {
                });
            }
        });
        this.subscriptions.push(sub);
        sub = this.authenticationService.loginEvent.subscribe(jwt => {
            if (!!jwt) {
                sub = this.tickApi.getCurrentTick().subscribe(resp => this.currentTick = resp);
                this.subscriptions.push(sub);
                const isAdmin = jwt.role === RoleEnum.ADMIN;
                if (isAdmin) {
                    sub = this.adminApi.getVersion().subscribe(resp => this.applicationInfo = resp);
                    this.subscriptions.push(sub);
                }
            }
        });
        this.subscriptions.push(sub);
        sub = this.authenticationService.logoutEvent.subscribe(loggedOut => {
            if (loggedOut) {
                this.currentTick = undefined;
            }
        });
        this.subscriptions.push(sub);
    }

    logout() {
        this.isLoggedIn = false;
        this.isAdmin = false;
        this.authenticationService.logout();
    }

    navigate(route?: Route) {
        if (!route) {
            route = NavigationCreationService.getLoginRoute();
        }
        this.activeRoute = route;
        this.router.navigateByUrl("/" + route.path).then(() => {
        });
        const path = this.activeRoute.path;
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event: any) {
        this.logout();
    }
}
