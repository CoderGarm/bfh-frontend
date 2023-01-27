import {AuthRequest} from '../../../services/swagger';
import {AuthenticationService} from '../../../services/authentication';

import {Component, OnInit} from '@angular/core';
import {FormControl, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {NgxPermissionsService} from 'ngx-permissions';
import {SubscriptionManager} from "../../../SubscriptionManager";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatFormFieldControl} from "@angular/material/form-field";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent extends SubscriptionManager implements OnInit {

    static path: string = 'login';

    loginForm: UntypedFormGroup;
    isAuthenticated: boolean = false;

    constructor(protected authService: AuthenticationService,
                private tokenService: TokenStorage,
                private permissionsService: NgxPermissionsService) {
        super();

        this.loginForm = new UntypedFormGroup({
            login: new UntypedFormControl(''),
            pass: new UntypedFormControl('')
        });
        if (this.tokenService.isLocalhost()) {
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

    keywords = ['angular', 'how-to', 'tutorial', 'accessibility'];
    formControl = new FormControl(['angular']);
    f: MatFormFieldControl<any> = new class extends MatFormFieldControl<any> {
        onContainerClick(event: MouseEvent): void {
        }

        setDescribedByIds(ids: string[]): void {
        }
    }

    removeKeyword(keyword: string) {
        const index = this.keywords.indexOf(keyword);
        if (index >= 0) {
            this.keywords.splice(index, 1);
        }
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our keyword
        if (value) {
            this.keywords.push(value);
        }

        // Clear the input value
        event.chipInput!.clear();
    }
}
