import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {ActivatedRoute} from "@angular/router";
import {AuthApiService, ChangePassword} from "../../../services/swagger";
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {PasswordErrorMessages} from "../../../validators/password.validator";

@Component({
    selector: 'app-forgotten-password',
    templateUrl: './forgotten-password.component.html',
    styleUrls: ['./forgotten-password.component.scss']
})
export class ForgottenPasswordComponent extends SubscriptionManager implements OnInit {

    static path: string = 'forgotten-password';
    static paramPath: string = 'forgotten-password/:id';

    id?: string;

    username?: string;
    eMail?: string;

    passErrors = PasswordErrorMessages;

    registerForm: UntypedFormGroup;

    constructor(private route: ActivatedRoute,
                private authApi: AuthApiService) {
        super();

        this.registerForm = new UntypedFormGroup({
            pass: new UntypedFormControl('', [Validators.required]),
            passRepeat: new UntypedFormControl('', Validators.required)
        });
    }

    ngOnInit() {
        const s = this.route.snapshot.paramMap.get('id');
        this.id = !!s ? s : undefined;
    }

    clear() {
        this.username = undefined;
        this.eMail = undefined;
        this.registerForm.controls.pass.setValue('');
        this.registerForm.controls.passRepeat.setValue('');
    }

    submitChangePasswordRequest() {
        const request: ChangePassword = {
            username: this.username,
            eMail: this.eMail
        }
        let sub = this.authApi.requestPasswordChange(request).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    submitPasswordChange() {
        if (this.registerForm.valid) {
            let sub = this.authApi.processPasswordChange(this.id!, this.registerForm.controls.pass.value).subscribe(() => {
            });
            this.subscriptions.push(sub);
        }
    }
}
