import {Directive, OnDestroy} from '@angular/core';
import {NG_VALIDATORS, UntypedFormGroup, ValidationErrors, Validator} from '@angular/forms';
import {AuthApiService} from "../services/swagger";
import {Subscription} from "rxjs";


export const UserErrorMessages: { [key: string]: string } = {
    userNameInvalid: 'The username is already in use.',
    userNamePatternInvalid: 'The username must contain of 3 to 30 characters of numbers or letters.',
    eMailInvalid: 'The eMail address is already in use.'
};

@Directive({
    selector: '[userNameValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: UserNameValidatorDirective, multi: true}]
})
export class UserNameValidatorDirective implements Validator, OnDestroy {

    subscriptions: Subscription[] = [];

    username: string = '';

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    constructor(private authAPi: AuthApiService) {
    }

    validate(control: UntypedFormGroup): ValidationErrors {
        const loginControl = control.get('login');
        if (!!loginControl) {
            let username: string = loginControl.value;
            if (username != this.username && loginControl.dirty && !!username) {
                this.username = username;
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
    selector: '[usernamePatternValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: UsernamePatternValidatorDirective, multi: true}]
})
export class UsernamePatternValidatorDirective implements Validator {
    validate(control: UntypedFormGroup): ValidationErrors {
        return loginPattern(control);
    }
}

export function loginPattern(control: UntypedFormGroup): ValidationErrors {

    const loginControl = control.get('login');
    const regex: RegExp = new RegExp(/^[a-zA-Z0-9]{3,30}$/);

    if (!!loginControl) {
        let loginString: string = loginControl.value;
        const matchRegex = regex.test(loginString)
        if (loginControl.dirty && !matchRegex) {
            loginControl.markAsTouched();
            loginControl.setErrors({userNamePatternInvalid: true});
        }
    }

    return {};
}


