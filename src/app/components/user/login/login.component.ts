import {AuthRequest, PublicResourcesApiService} from '../../../services/swagger';
import {AuthenticationService} from '../../../services/authentication';

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgxPermissionsService} from 'ngx-permissions';
import {SubscriptionManager} from "../../../subscription.manager";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent extends SubscriptionManager implements OnInit {

    static path: string = 'login';

    loginForm: FormGroup;
    isAuthenticated: boolean = false;
    hide: boolean = true;

    userNames: string[] = [];

    constructor(protected authService: AuthenticationService,
                protected publicResourceService: PublicResourcesApiService,
                private permissionsService: NgxPermissionsService) {
        super();

        this.loginForm = new FormGroup({
            login: new FormControl(undefined, Validators.required),
            pass: new FormControl(undefined, Validators.required)
        });

        if (this.tokenStorage.isLocalhost()) {
            let sub = this.publicResourceService.getUsernames().subscribe(resp => this.userNames = resp.sort((a, b) => a.localeCompare(b)));
            this.subscriptions.push(sub);
        }
    }

    ngOnInit(): void {
    }

    submitLogin() {
        if (this.isSubmitDisabled()) {
            return;
        }
        const login: AuthRequest = {
            username: this.loginForm.controls.login.value,
            password: this.loginForm.controls.pass.value,
        }
        const sub = this.authService.login(login).subscribe(
            resp => {
                if (!!resp) {
                    this.isAuthenticated = !!resp;
                } else {
                    this.clear();
                }
            }
        );
        this.subscriptions.push(sub);
    }

    isSubmitDisabled() {
        return !this.loginForm.valid || this.isAuthenticated;
    }

    clear() {
        this.authService.clear();
        this.permissionsService.flushPermissions();
        this.loginForm.controls.login.setValue(undefined);
        this.loginForm.controls.pass.setValue(undefined);
    }

    toggleHide(event: MouseEvent) {
        if (event.detail > 0) { // ignoring click event from submit type button
            this.hide = !this.hide;
        }
    }

    setLogin(name: string) {
        this.loginForm.controls.login.setValue(name);
    }
}
