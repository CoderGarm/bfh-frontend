import {Directive, OnDestroy} from '@angular/core';
import {NG_VALIDATORS, UntypedFormGroup, ValidationErrors, Validator} from '@angular/forms';
import {Subscription} from "rxjs";
import {AllianceApiService} from "../../../services/swagger";


export const AllianceErrorMessages: { [key: string]: string } = {
    allianceNameInvalid: 'The name is already in use.',
    allianceCodeInvalid: 'The code is already in use.',
};

@Directive({
    selector: '[allianceNameValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: AllianceNameValidatorDirective, multi: true}]
})
export class AllianceNameValidatorDirective implements Validator, OnDestroy {

    subscriptions: Subscription[] = [];

    oldValue: string = '';

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    constructor(private authAPi: AllianceApiService) {
    }

    validate(control: UntypedFormGroup): ValidationErrors {
        const formControl = control.get('allianceNameFC');
        if (!!formControl) {
            let value: string = formControl.value;
            if (value != this.oldValue && formControl.dirty && !!value) {
                this.oldValue = value;
                formControl.markAsTouched();
                let sub = this.authAPi.checkAllianceName(value).subscribe(resp => {
                    if (!resp) {
                        formControl.setErrors({allianceNameInvalid: true});
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        return {};
    }
}

@Directive({
    selector: '[allianceCodeValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: AllianceCodeValidatorDirective, multi: true}]
})
export class AllianceCodeValidatorDirective implements Validator, OnDestroy {

    subscriptions: Subscription[] = [];

    oldValue: string = '';

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    constructor(private authAPi: AllianceApiService) {
    }

    validate(control: UntypedFormGroup): ValidationErrors {
        const formControl = control.get('allianceCodeFC');
        if (!!formControl) {
            let value: string = formControl.value;
            if (value != this.oldValue && formControl.dirty && !!value) {
                this.oldValue = value;
                formControl.markAsTouched();
                let sub = this.authAPi.checkCode(value).subscribe(resp => {
                    if (!resp) {
                        formControl.setErrors({allianceCodeInvalid: true});
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        return {};
    }
}


