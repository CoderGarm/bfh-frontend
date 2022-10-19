import {AuthApiService, UserApiService, UserReq} from '../../../services/swagger';
import {PasswordErrorMessages} from '../../../validators/passwordValidator';
import {FormControl, FormGroup, Validators} from '@angular/forms';
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
    registerForm: FormGroup;

    inProgress: boolean = false;

    constructor(private userApiService: UserApiService,
                private authService: AuthApiService,
                private tokenService: TokenStorage,
                private snackbarService: SnackbarNotificationService,
                private spinnerService: SpinnerService,
                public translate: TranslateService) {
        super();
        let utcDate = new Date().getMilliseconds();
        this.registerForm = new FormGroup({
            login: new FormControl('', Validators.required),
            pass: new FormControl('', [Validators.required]),
            passRepeat: new FormControl('', Validators.required),
            email: new FormControl('', Validators.email)
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
                //this.inProgress = false;
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
