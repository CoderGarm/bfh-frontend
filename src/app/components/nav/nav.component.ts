import {ProfileComponent} from './../user/profile/profile.component';
import {AuthenticationService} from './../../services/authentication/authentication.service';
import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TokenStorage} from "../../services/authentication/token-storage.service";
import {JWT, Tick, TickApiService} from "../../services/swagger";
import {SubscriptionManager} from "../../SubscriptionManager";
import RoleEnum = JWT.RoleEnum;


@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent extends SubscriptionManager implements OnInit {

    isLoggedIn: boolean = false;
    isAdmin: boolean = false;

    currentTick?: Tick;

    constructor(private router: Router,
                private authenticationService: AuthenticationService,
                private tokenStorage: TokenStorage,
                private tickApi: TickApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.authenticationService.getAccessData().subscribe(loggedIn => {
            this.isLoggedIn = !!loggedIn;
            if (this.isLoggedIn && !this.tokenStorage.getInterruptedURL()) {
                this.isAdmin = loggedIn.role === RoleEnum.ADMIN;
                this.router.navigateByUrl(ProfileComponent.path);
            }
        });
        this.subscriptions.push(sub);
        sub = this.authenticationService.loginInEvent.subscribe(jwt => {
            if (!!jwt) {
                sub = this.tickApi.getCurrentTick().subscribe(resp => this.currentTick = resp);
                this.subscriptions.push(sub);
            }
        });
        this.subscriptions.push(sub);
        sub = this.authenticationService.loginOutEvent.subscribe(loggedOut => {
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

    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event: any) {
        this.logout();
    }
}
