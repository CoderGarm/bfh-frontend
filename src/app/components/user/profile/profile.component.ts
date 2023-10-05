import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {AuthApiService, RolePlayApiService, RolePlayData, UserApiService, UserSettings} from "../../../services/swagger";
import {FormBuilder, FormControl, FormGroup, ValidationErrors} from "@angular/forms";
import {SnackbarNotificationService} from "../../../services/snackbar-notification.service";
import {MatSelectionList} from "@angular/material/list";
import {SingleTouchedFormFieldErrorStateMatcher} from "../../../validators/single-touched-form-field-error-state-matcher";
import {UserErrorMessages} from "../../../validators/username.validator";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends SubscriptionManager implements OnInit, AfterViewInit {

    matcher = new SingleTouchedFormFieldErrorStateMatcher();

    role?: string;

    eMailFormGroup: FormGroup;
    rpgFormGroup: FormGroup;
    eMailChangeFormGroup: FormGroup;
    userErrors = UserErrorMessages;

    private disabled: boolean = true;
    noEMailConfigPossible: boolean = true;

    private userSetting?: UserSettings;

    /**
     * Please update if there are new icons.
     */
    userIcons: string[] = [
        'dragon-head.png',
        'disintegrate.png',
        'bear-head.png',
        'angler-fish.png',
        'winged-sword.png',
        'triton-head.png',
        'ship-wheel.png',
        'shark-bite.png',
        'quake-stomp.png',
        'police-officer-head.png',
        'mouth-watering.png',
        'dwarf-face.png',
        'drop-weapon.png'
    ];

    selectedIcon: string = 'perspective-dice-six-faces-random.png';

    @ViewChild("iconSelector")
    iconSelector?: MatSelectionList;

    constructor(private formBuilder: FormBuilder,
                private authService: AuthApiService,
                private notif: SnackbarNotificationService,
                private userService: UserApiService,
                private rpgService: RolePlayApiService) {
        super();

        this.eMailFormGroup = this.formBuilder.group({
            receiveChangelogInfos: false,
            eMailVerified: false,
            noEMailWanted: false,
        });
        this.eMailFormGroup.controls.eMailVerified.disable({onlySelf: true});
        this.eMailFormGroup.controls.noEMailWanted.disable({onlySelf: true});

        this.eMailFormGroup.valueChanges.subscribe(val => {
            if (!this.disabled) {
                const userSettings = <UserSettings>val;
                let sub = this.userService.changeSettings(userSettings).subscribe(resp => {
                    this.userSetting = resp;
                    this.notif.short('saved');
                });
                this.subscriptions.push(sub);
            }
        });

        this.rpgFormGroup = this.formBuilder.group({
            title: undefined,
            titleAbbreviation: undefined,
            firstname: undefined,
            surname: undefined,
        });

        this.eMailChangeFormGroup = this.formBuilder.group({
            eMail: ''
        });
    }

    ngAfterViewInit(): void {
        this.iconSelector!.selectionChange.subscribe(change => {
            this.selectedIcon = this.iconSelector!.selectedOptions.hasValue() ? this.iconSelector!.selectedOptions.selected[0].value : this.selectedIcon;
            this.userSetting!.profilePic = this.selectedIcon.split('.')[0];
            let sub = this.userService.changeSettings(this.userSetting!).subscribe(resp => {
                this.userSetting = resp;
                this.notif.short('saved');
            });
            this.subscriptions.push(sub);
        });
        let sub = this.rpgService.getRPGData().subscribe(resp => this.createRPGForm(resp));
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
        this.role = this.tokenStorage.getRole();
        let sub = this.userService.getSettings().subscribe(resp => {
            this.userSetting = resp;
            const eMailVerified = resp.eMailVerified;
            const noEMailWanted = resp.noEMailWanted;
            this.noEMailConfigPossible = !eMailVerified && noEMailWanted;

            if (!!resp.eMail) {
                this.eMailChangeFormGroup = this.formBuilder.group({
                    eMail: this.createFormControlEMailValidation(resp.eMail)
                });
            }

            this.eMailFormGroup.controls.receiveChangelogInfos.setValue(resp.receiveChangelogInfos);
            if (this.noEMailConfigPossible) {
                this.eMailFormGroup.controls.receiveChangelogInfos.disable({onlySelf: true});
            } else {
                this.eMailFormGroup.controls.receiveChangelogInfos.enable();
            }
            this.eMailFormGroup.controls.eMailVerified.setValue(eMailVerified);
            this.eMailFormGroup.controls.noEMailWanted.setValue(noEMailWanted);
            this.disabled = false;
            this.selectedIcon = resp.profilePic + '.png';
        });
        this.subscriptions.push(sub);
    }

    clear() {
        this.rpgFormGroup.controls.title.setValue(undefined);
        this.rpgFormGroup.controls.titleAbbreviation.setValue(undefined);
        this.rpgFormGroup.controls.firstname.setValue(undefined);
        this.rpgFormGroup.controls.surname.setValue(undefined);
    }

    submitRPGStuff() {
        const rpg: RolePlayData = {
            title: this.rpgFormGroup.controls.title.value,
            titleAbbreviation: this.rpgFormGroup.controls.titleAbbreviation.value,
            firstname: this.rpgFormGroup.controls.firstname.value,
            surname: this.rpgFormGroup.controls.surname.value,
            shipNames: [],
            shipNameTemplates: [],
            shipPrefix: undefined
        }
        let sub = this.rpgService.setRPGData(rpg).subscribe(() => {
        });
        this.subscriptions.push(sub);
    }

    private createRPGForm(resp: RolePlayData) {
        this.rpgFormGroup = this.formBuilder.group({
            title: this.createFormControlTextLengthValidation(3, 50, resp.title),
            titleAbbreviation: this.createFormControlTextLengthValidation(3, 8, resp.titleAbbreviation),
            firstname: this.createFormControlTextLengthValidation(3, 50, resp.firstname),
            surname: this.createFormControlTextLengthValidation(3, 50, resp.surname)
        });
    }

    private createFormControlTextLengthValidation(min: number, max: number, initialValue?: string) {
        return new FormControl(initialValue, [control => {
            const v: ValidationErrors = {};
            const isError = !!control && !!control.value ? ((<string>control.value).length < min || (<string>control.value).length > max) : false;
            if (isError) {
                control.setErrors({tooLong: true});
            }
            return v;
        }]);
    }

    private createFormControlEMailValidation(initialValue?: string) {
        return new FormControl(initialValue, [control => {
            const v: ValidationErrors = {};
            if (!!control.value) {
                let sub = this.authService.checkEmail(control.value).subscribe(resp => {
                    if (!resp) {
                        control.setErrors({eMailInvalid: true});
                    }
                });
                this.subscriptions.push(sub);
            }
            return v;
        }]);
    }

    submitEMailChange() {
        let sub = this.userService.requestEMailChange(this.eMailChangeFormGroup.controls.eMail.value).subscribe(() => this.ngOnInit());
        this.subscriptions.push(sub);
    }

    clearEMailChange() {
        let eMail = !!this.userSetting && !!this.userSetting.eMail ? this.userSetting.eMail : '';
        this.eMailChangeFormGroup = this.formBuilder.group({
            eMail: this.createFormControlEMailValidation(eMail)
        });
    }
}
