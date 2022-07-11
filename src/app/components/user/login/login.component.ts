import {AuthRequest} from '../../../services/swagger';
import {AuthenticationService} from '../../../services/authentication';

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {NgxPermissionsService} from 'ngx-permissions';
import {Subscription} from "rxjs";
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    protected basePath = environment.backendServer;

    static path: string = 'login';

    private subscription?: Subscription;

    loginForm: FormGroup;
    isAuthenticated: boolean = false;

    constructor(protected authService: AuthenticationService,
                private permissionsService: NgxPermissionsService) {
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

        this.subscription = this.authService.login(login).subscribe(
            resp => {
                this.isAuthenticated = !!resp;
            },
            error => {
                this.clear();
            }
        );

    }


    clear() {

        this.authService.clear();
        this.permissionsService.flushPermissions();

        this.loginForm = new FormGroup({
            login: new FormControl(''),
            pass: new FormControl('')
        });
    }

    ngOnDestroy() {
        if (!!this.subscription) {
            this.subscription.unsubscribe()
        }
    }
}
