import {Directive} from '@angular/core';
import {FormGroup, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';
import {AuthApiService} from "../services/swagger";
import {Subscription} from "rxjs";


export const UserErrorMessages: { [key: string]: string } = {
    userNameInvalid: 'The username is already in use.',
    eMailInvalid: 'The eMail address is already in use.'
};

@Directive({
    selector: '[userNameValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: UserNameValidatorDirective, multi: true}]
})
export class UserNameValidatorDirective implements Validator {

    subscriptions: Subscription[] = [];

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    constructor(private authAPi: AuthApiService) {
    }

    validate(control: FormGroup): ValidationErrors {
        const loginControl = control.get('login');
        if (!!loginControl) {
            let username: string = loginControl.value;
            if (loginControl.dirty && !!username) {
                loginControl.markAsTouched();
                let sub = this.authAPi.checkUsername(username).subscribe(resp => {
                    if (!resp) {
                        loginControl.setErrors({userNameInvalid: true});
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        return {};
    }
}

@Directive({
    selector: '[eMailValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: EMailValidatorDirective, multi: true}]
})
export class EMailValidatorDirective implements Validator {

    subscriptions: Subscription[] = [];

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    constructor(private authAPi: AuthApiService) {
    }

    validate(control: FormGroup): ValidationErrors {
        const eMailControl = control.get('email');
        if (!!eMailControl) {
            let eMailAddress: string = eMailControl.value;
            if (eMailControl.dirty && !!eMailAddress) {
                eMailControl.markAsTouched();
                let sub = this.authAPi.checkEmail(eMailAddress).subscribe(resp => {
                    if (!resp) {
                        eMailControl.setErrors({eMailInvalid: true});
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        return {};
    }
}


