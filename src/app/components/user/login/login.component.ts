import {AuthRequest} from '../../../services/swagger';
import {AuthenticationService} from '../../../services/authentication';

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {NgxPermissionsService} from 'ngx-permissions';
import {environment} from "../../../../environments/environment";
import {SubscriptionManager} from "../../../SubscriptionManager";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent extends SubscriptionManager implements OnInit {

    protected basePath = environment.backendServer;

    static path: string = 'login';

    loginForm: FormGroup;
    isAuthenticated: boolean = false;

    constructor(protected authService: AuthenticationService,
                private permissionsService: NgxPermissionsService) {
        super();

        this.loginForm = new FormGroup({
            login: new FormControl(''),
            pass: new FormControl('')
        });
        if (this.basePath.includes("localhost")) {
            this.loginForm.controls.login.setValue('flashkid');
            this.loginForm.controls.pass.setValue('12457aA!');
        }
    }

    ngOnInit(): void {
    }

    submitLogin() {
        const login: AuthRequest = {
            username: this.loginForm.controls.login.value,
            password: this.loginForm.controls.pass.value,
        }

        const sub = this.authService.login(login).subscribe(
            resp => this.isAuthenticated = !!resp,
            () => this.clear()
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
