import {AuthRequest} from '../../../services/swagger';
import {AuthenticationService} from '../../../services/authentication';

import {Component, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {NgxPermissionsService} from 'ngx-permissions';
import {SubscriptionManager} from "../../../subscription.manager";
import {TokenStorage} from "../../../services/authentication/token-storage.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent extends SubscriptionManager implements OnInit {

    static path: string = 'login';

    loginForm: UntypedFormGroup;
    isAuthenticated: boolean = false;
    hide: boolean = true;

    constructor(protected authService: AuthenticationService,
                private tokenService: TokenStorage,
                private permissionsService: NgxPermissionsService) {
        super();

        this.loginForm = new UntypedFormGroup({
            login: new UntypedFormControl(''),
            pass: new UntypedFormControl('')
        });
    }

    ngOnInit(): void {
    }

    submitLogin() {
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


    clear() {
        this.authService.clear();
        this.permissionsService.flushPermissions();
        this.loginForm.controls.login.setValue('');
        this.loginForm.controls.pass.setValue('');
    }
}
