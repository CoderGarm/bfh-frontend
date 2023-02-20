import {Directive} from '@angular/core';
import {NG_VALIDATORS, UntypedFormGroup, ValidationErrors, Validator} from '@angular/forms';
import {ShipyardApiService} from "../services/swagger";
import {TokenStorage} from "../services/authentication/token-storage.service";
import {Subscription} from "rxjs";


export const ShipClassNamePatternErrorMessages: { [key: string]: string } = {
    passPattern: 'The must contain between 3 and 30 characters.',
    passAlreadyKnown: 'The name is already known.'
};


@Directive({
    selector: '[shipClassNamePatternValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: ShipClassNamePatternValidatorDirective, multi: true}]
})
export class ShipClassNamePatternValidatorDirective implements Validator {

    private subscriptions: Subscription[] = [];

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    constructor(private shipYardApi: ShipyardApiService, private tokenStorage: TokenStorage) {
    }

    validate(control: UntypedFormGroup): ValidationErrors {
        const passControl = control.get('scName');
        let validationResult: ValidationErrors = passPattern(control);
        if (!!passControl && passControl.dirty && !passControl?.getError('passPattern')) {
            if (!!passControl) {
                let userID = this.tokenStorage.getUserID();
                if (!userID) {
                    return validationResult;
                }
                let passString: string = passControl.value;
                let sub = this.shipYardApi.checkClassName(passString).subscribe(resp => {
                    if (!resp) {
                        passControl.setErrors({passAlreadyKnown: true});
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        return validationResult;
    }
}

export function passPattern(control: UntypedFormGroup): ValidationErrors {

    const passControl = control.get('scName');
    const regex: RegExp = new RegExp(/((.).{2,31})/);

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


