import {Directive, OnDestroy} from '@angular/core';
import {NG_VALIDATORS, UntypedFormGroup, ValidationErrors, Validator} from '@angular/forms';
import {AuthApiService} from "../services/swagger";
import {Subscription} from "rxjs";

@Directive({
    selector: '[eMailValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: EMailValidatorDirective, multi: true}]
})
export class EMailValidatorDirective implements Validator, OnDestroy {

    subscriptions: Subscription[] = [];

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    constructor(private authAPi: AuthApiService) {
    }

    validate(control: UntypedFormGroup): ValidationErrors {
        const eMailControl = control.get('email');
        const noEMailWantedControl = control.get('noEMailWanted')!;
        const noEMailWantedValue = noEMailWantedControl.value;
        if (!!eMailControl && !noEMailWantedValue) {
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


