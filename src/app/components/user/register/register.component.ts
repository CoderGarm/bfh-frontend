import {AuthApiService, InitialPlayerSettings, UserReq} from '../../../services/swagger';
import {PasswordErrorMessages} from '../../../validators/password.validator';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component} from '@angular/core';
import {UserErrorMessages} from "../../../validators/username.validator";
import {SubscriptionManager} from "../../../subscription.manager";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {TranslateService} from "@ngx-translate/core";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {DialogConfigHelper} from "../../../services/helper/dialog-config.helper";
import {MatDialog} from "@angular/material/dialog";
import {DetailsStepComponent, PlayerSettings} from "./payload/details-step/details-step.component";
import {RegisterEventService} from "./register-event.service";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends SubscriptionManager {

    static path: string = 'register';

    passErrors = PasswordErrorMessages;
    userErrors = UserErrorMessages;
    registerForm: UntypedFormGroup;

    inProgress: boolean = false;

    constructor(private registerEventService: RegisterEventService,
                private authService: AuthApiService,
                private tokenService: TokenStorage,
                public translate: TranslateService,
                private dialog: MatDialog) {
        super();
        let utcDate = new Date().getMilliseconds();
        this.registerForm = new UntypedFormGroup({
            login: new UntypedFormControl('', Validators.required),
            pass: new UntypedFormControl('', [Validators.required]),
            passRepeat: new UntypedFormControl('', Validators.required),
            email: new UntypedFormControl('', Validators.email),
            noEMailWanted: new UntypedFormControl(false)
        });
        if (this.tokenService.isLocalhost()) {
            this.registerForm.controls.login.setValue(utcDate);
            this.registerForm.controls.pass.setValue('12457aA!');
            this.registerForm.controls.passRepeat.setValue('12457aA!');
            this.registerForm.controls.email.setValue(utcDate + '@' + utcDate);
        }
    }

    submitRegister(): void {
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
        this.openRegisterStep2(newUser);
        const sub = this.authService.createUser(newUser)
            .subscribe(resp => this.registerEventService.sendIdUser(resp.idUser));
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

    openRegisterStep2(newUser: UserReq) {
        const dialogConfig = DialogConfigHelper.createDialog();
        dialogConfig.data = newUser;
        dialogConfig.width = '90%';
        (<string[]>dialogConfig.panelClass).push('register-step-2')
        const dialogRef = this.dialog.open(DetailsStepComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result?: PlayerSettings) => {
            if (!result) {
                return;
            }

            const settings: InitialPlayerSettings = {
                receiveChangelogInfos: result.receiveChangelogInfos!,
                receiveTickAdvice: result.receiveTickAdvice!,
                rolePlayData: {
                    title: result.title,
                    titleAbbreviation: result.titleAbbreviation,
                    firstname: result.firstname,
                    surname: result.surname,
                    shipPrefix: result.shipPrefix,
                    shipNameTemplates: [],
                    shipNames: [],
                    textBlocks: {}
                },
                profilePic: !!result.profilePic ? result.profilePic.replace('.png', '') : 'perspective-dice-six-faces-random'
            };
            let sub = this.authService.initialPlayerSettings(result.idUser!, newUser.password, settings)
                .subscribe(() => {
                });
            this.subscriptions.push(sub);
        });
    }
}
