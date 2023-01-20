import {AuthApiService, UserApiService, UserReq} from '../../../services/swagger';
import {PasswordErrorMessages} from '../../../validators/passwordValidator';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {UserErrorMessages} from "../../../validators/userNameValidator";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {SnackbarNotificationService} from "../../../services/snackbar-notification.service";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {TranslateService} from "@ngx-translate/core";
import {SpinnerService} from "../../../services/spinner.service";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends SubscriptionManager implements OnInit {

    static path: string = 'register';

    passErrors = PasswordErrorMessages;
    userErrors = UserErrorMessages;
    registerForm: UntypedFormGroup;

    inProgress: boolean = false;

    constructor(private userApiService: UserApiService,
                private authService: AuthApiService,
                private tokenService: TokenStorage,
                private snackbarService: SnackbarNotificationService,
                private spinnerService: SpinnerService,
                public translate: TranslateService) {
        super();
        let utcDate = new Date().getMilliseconds();
        this.registerForm = new UntypedFormGroup({
            login: new UntypedFormControl('', Validators.required),
            pass: new UntypedFormControl('', [Validators.required]),
            passRepeat: new UntypedFormControl('', Validators.required),
            email: new UntypedFormControl('', Validators.email)
        });
        if (this.tokenService.isLocalhost()) {
            this.registerForm.controls.login.setValue(utcDate);
            this.registerForm.controls.pass.setValue('12457aA!');
            this.registerForm.controls.passRepeat.setValue('12457aA!');
            this.registerForm.controls.email.setValue(utcDate + '@' + utcDate);
        }

        // just make sure that the key exists
        this.translate.get('register.spinner-message');
    }

    ngOnInit(): void {
    }

    submitRegister(): void {
        this.spinnerService.activateSpinner('register.spinner-message');
        let newUser: UserReq = {
            email: this.registerForm.controls.email.value,
            password: this.registerForm.controls.pass.value,
            username: this.registerForm.controls.login.value
        };
        const sub = this.authService.createUser(newUser)
            .subscribe(() => {
                this.spinnerService.deactivateSpinner();
                this.snackbarService.open("Yeah nice, you are registered! Log in now.");
            });
        this.subscriptions.push(sub);
    }

    clear(): void {
        this.registerForm.controls.login.setValue('');
        this.registerForm.controls.pass.setValue('');
        this.registerForm.controls.passRepeat.setValue('');
        this.registerForm.controls.email.setValue('');
    }
}
