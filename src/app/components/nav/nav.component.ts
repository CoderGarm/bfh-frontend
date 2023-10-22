import {AuthenticationService} from '../../services/authentication';
import {Component, HostListener, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {AdminApiService, ApplicationInfo, JWT, TickApiService} from "../../services/swagger";
import {SubscriptionManager} from "../../subscription.manager";
import {NavigationCreationService} from "../../services/navigation/navigation-creation.service";
import {CurrentTickService} from "../../services/intercom/current-tick.service";
import {ColorSchemeService} from "../../services/color-scheme.service";
import {NavigationCommunicationService} from "../../services/navigation/navigation-communication.service";
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

    activeRoute?: Route;
    honorverseMapPath: string;
    profilePic: string;

    isDark: boolean = true;

    constructor(private router: Router,
                private colorSchemeService: ColorSchemeService,
                private authenticationService: AuthenticationService,
                private navService: NavigationCommunicationService,
                private tickApi: TickApiService,
                private adminApi: AdminApiService,
                protected currentTickService: CurrentTickService) {
        super();

        this.honorverseMapPath = 'https://map.battleforhonor.de/';
        this.profilePic = 'perspective-dice-six-faces-random';

        this.colorSchemeService.getSchemaEmitter().subscribe(schema => {
            switch (schema) {
                case 'dark':
                    this.isDark = true;
                    break;
                case 'light':
                    this.isDark = false;
                    break;
            }
        });
    }

    ngOnInit(): void {
        let sub = this.authenticationService.getAccessData().subscribe(jwt => {
            this.isLoggedIn = !!jwt;
            if (this.isLoggedIn && !this.tokenStorage.getInterruptedURL()) {
                this.isAdmin = jwt.role === RoleEnum.ADMIN;
                this.profilePic = jwt.profilePic;
                this.router.navigateByUrl(NavigationCreationService.AFTER_LOGIN_ROUTE).then(() => {
                });
            }
        });
        this.subscriptions.push(sub);
        sub = this.authenticationService.loginEvent.subscribe(jwt => {
            if (!!jwt) {
                sub = this.tickApi.getCurrentTick().subscribe(resp => this.currentTickService.setTick(resp));
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
                this.currentTickService.clear();
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
        this.navService.navigate(route);
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event: any) {
        this.logout();
    }

    toggleDarkMode() {
        this.colorSchemeService.toggle();
    }
}
