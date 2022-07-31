import {Component, OnInit} from '@angular/core';
import {AdminApiService, JWT} from "../../../../../services/swagger";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {Router} from "@angular/router";
import {LoginComponent} from "../../../../../components/user/login/login.component";
import {AuthenticationService} from "../../../../../services/authentication";
import RoleEnum = JWT.RoleEnum;

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-tab-view.component.html',
    styleUrls: ['./admin-tab-view.component.scss']
})
export class AdminTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'admin';

    isLoggedIn: boolean = false;
    isAdmin: boolean = false;

    constructor(private router: Router,
                private adminApi: AdminApiService,
                private authenticationService: AuthenticationService,
                private tokenStorage: TokenStorage) {
        super();
    }

    ngOnInit(): void {
        let role = this.tokenStorage.getRole();
        this.isLoggedIn = !!role;
        if (this.isLoggedIn) {
            this.isAdmin = role == RoleEnum.ADMIN;
        }
        if (!this.isLoggedIn || !this.isAdmin) {
            this.isLoggedIn = false;
            this.isAdmin = false;
            this.authenticationService.logout();
            this.router.navigateByUrl(LoginComponent.path).then(() => {
            });
        }
    }

    doTick() {
        let outerSub = this.adminApi.doTick().subscribe(() => {
        });
        this.subscriptions.push(outerSub);
    }

}
