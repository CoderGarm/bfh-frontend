import {Directive} from '@angular/core';
import {FormGroup, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';


export const PasswordErrorMessages: { [key: string]: string } = {
    passwordNotEqual: 'The passwords didn\'t match.',
    passPattern: 'The password didn\'t match the pattern.'
};

@Directive({
    selector: '[passwordEqualityValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: PasswordEqualityValidatorDirective, multi: true}]
})
export class PasswordEqualityValidatorDirective implements Validator {
    validate(control: FormGroup): ValidationErrors {
        return passEqual(control);
    }
}

export function passEqual(control: FormGroup): ValidationErrors {

    const passControl = control.get('pass');
    const repeatControl = control.get('passRepeat');

    if (!!passControl && !!repeatControl) {

        let passString: string = passControl.value;
        let repeatString: string = repeatControl.value;

        if (repeatControl.dirty && passString !== repeatString) {
            repeatControl.markAsTouched();
            repeatControl.setErrors({passwordNotEqual: true});
        }
    }
    return {};
}

@Directive({
    selector: '[passwordPatternValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: PasswordPatternValidatorDirective, multi: true}]
})
export class PasswordPatternValidatorDirective implements Validator {
    validate(control: FormGroup): ValidationErrors {
        return passPattern(control);
    }
}

export function passPattern(control: FormGroup): ValidationErrors {

    const passControl = control.get('pass');
    const regex: RegExp = new RegExp(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30})/);

    if (!!passControl) {
        let passString: string = passControl.value;
        const matchRegex = regex.test(passString);

        if (passControl.dirty && !matchRegex) {
            passControl.markAsTouched();
            passControl.setErrors({passPattern: true});
        }
    }

    return {};
}


