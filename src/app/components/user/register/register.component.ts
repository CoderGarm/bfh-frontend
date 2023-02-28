import {AuthApiService, UserApiService, UserReq} from '../../../services/swagger';
import {PasswordErrorMessages} from '../../../validators/password.validator';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {UserErrorMessages} from "../../../validators/username.validator";
import {SubscriptionManager} from "../../../subscription.manager";
import {SnackbarNotificationService} from "../../../services/snackbar-notification.service";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {TranslateService} from "@ngx-translate/core";
import {SpinnerService} from "../../../services/spinner.service";
import {MatCheckboxChange} from "@angular/material/checkbox";

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
        this.registerForm = new UntypedFormGroup({
            login: new UntypedFormControl('', Validators.required),
            pass: new UntypedFormControl('', [Validators.required]),
            passRepeat: new UntypedFormControl('', Validators.required),
            email: new UntypedFormControl('', Validators.email),
            noEMailWanted: new UntypedFormControl(false)
        });

        // just make sure that the key exists
        this.translate.get('register.spinner-message');
    }

    ngOnInit(): void {
    }

    submitRegister(): void {
        this.spinnerService.activateSpinner('register.spinner-message');
        let email: string = this.registerForm.controls.email.value;
        const noEMailWanted: boolean = this.registerForm.controls.noEMailWanted.value;
        const userName: string = this.registerForm.controls.login.value;
        if (noEMailWanted) {
            email = userName + '@' + userName;
        }
        let newUser: UserReq = {
            email: email,
            noEMailWanted: noEMailWanted,
            password: this.registerForm.controls.pass.value,
            username: userName
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
        this.registerForm.controls.noEMailWanted.setValue(false);
    }

    changeNoEMailWanted(event: MatCheckboxChange) {
        this.registerForm.controls.noEMailWanted.setValue(event.checked);
        if (<boolean>this.registerForm.controls.noEMailWanted.value) {
            this.registerForm.controls.email.setValue('');
            this.registerForm.controls.email.disable({onlySelf: true});
            this.registerForm.controls.email.validator
        } else {
            this.registerForm.controls.email.enable();
        }
    }

    isRegisterValid() {
        let unCrit = this.registerForm.controls.login.valid;
        unCrit = unCrit && this.registerForm.controls.pass.valid;
        unCrit = unCrit && this.registerForm.controls.passRepeat.valid;
        let mailValid = this.registerForm.controls.email.valid;
        if (this.registerForm.controls.noEMailWanted.valid) {
            mailValid = true;
        }
        return (unCrit && mailValid) || this.inProgress;
    }
}
