import {AuthenticationService} from '../../services/authentication';
import {Component, HostListener, OnInit} from '@angular/core';
import {Route, Router, Routes} from '@angular/router';
import {AdminApiService, ApplicationInfo, JWT, TickApiService} from "../../services/swagger";
import {SubscriptionManager} from "../../subscription.manager";
import {NavigationCreationService} from "../../services/navigation/navigation-creation.service";
import {CurrentTickService} from "../../services/intercom/current-tick.service";
import {ColorSchemeService} from "../../services/color-scheme.service";
import {NavigationCommunicationService} from "../../services/navigation/navigation-communication.service";
import {interval} from "rxjs";
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
    profilePic: string;

    isDark: boolean = true;

    showSantasHat: boolean = false;
    tickCountdown: Date;

    constructor(private router: Router,
                private colorSchemeService: ColorSchemeService,
                private authenticationService: AuthenticationService,
                private navService: NavigationCommunicationService,
                private tickApi: TickApiService,
                private adminApi: AdminApiService,
                protected currentTickService: CurrentTickService) {
        super();

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

        this.detectSantaMode();
        this.tickCountdown = this.getTickCountdown();
        const source = interval(1000);
        let sub = source.subscribe(() => {
            this.tickCountdown = this.getTickCountdown();
        });
        this.subscriptions.push(sub);
    }

    private detectSantaMode() {
        const date = new Date();
        const month = date.getMonth() + 1;
        this.showSantasHat = month == 12;
    }

    getTickCountdown(): Date {
        const now = this.createDateInBerlinTimezone();
        const tickTime = new Date();
        tickTime.setHours(23, 59, 59, 999);

        const untilTick = tickTime.getTime() - now.getTime();
        const date = new Date();
        date.setTime(untilTick);
        return date;
    }

    createDateInBerlinTimezone(): Date {
        // Aktuelles UTC-Datum und -Uhrzeit abrufen
        const utcDateTime = new Date();

        // Zeitunterschied zwischen UTC und 'Europe/Berlin' in Minuten (UTC+1 oder UTC+2 je nach Sommer- oder Winterzeit)
        const berlinTimezoneOffset = this.isSummerTimeInGermany() ? 60 : 120; // Sommerzeit: 120, Winterzeit: 60
        // Das UTC-Datum und die -Uhrzeit um den Zeitunterschied anpassen
        return new Date(utcDateTime.getTime() + berlinTimezoneOffset * 60000);
    }

    isSummerTimeInGermany(): boolean {
        const now = new Date();
        const january = new Date(now.getFullYear(), 0, 1);
        const july = new Date(now.getFullYear(), 6, 1);

        // Überprüfen, ob die aktuelle Zeitzone UTC+2 (Sommerzeit) ist
        return now.getTimezoneOffset() < Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());
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
