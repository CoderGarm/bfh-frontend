import {Component, HostListener, Inject, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors} from "@angular/forms";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {SingleTouchedFormFieldErrorStateMatcher} from "../../../../../validators/single-touched-form-field-error-state-matcher";
import {MatSelectionList} from "@angular/material/list";
import {ProfileComponent} from "../../../profile/profile.component";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {UserReq} from "../../../../../services/swagger";
import {RegisterEventService} from "../../register-event.service";


export interface InitialPlayerSettings {
    receiveChangelogInfos?: boolean;
    noEMailWanted?: boolean;
    profilePic?: string;
    title?: string;
    titleAbbreviation?: string;
    firstname?: string;
    surname?: string;
    shipPrefix?: string;
}

@Component({
    selector: 'app-details-step',
    templateUrl: './details-step.component.html',
    styleUrls: ['./details-step.component.scss']
})
export class DetailsStepComponent extends SubscriptionManager {

    matcher = new SingleTouchedFormFieldErrorStateMatcher();
    rpgFormGroup: FormGroup;

    userIcons: string[] = ProfileComponent.USER_ICONS;

    @ViewChild("iconSelector")
    iconSelector?: MatSelectionList;

    result: InitialPlayerSettings = {
        profilePic: 'perspective-dice-six-faces-random.png'
    }

    newUser?: UserReq;
    idUser?: number;

    constructor(private formBuilder: FormBuilder,
                private registerEventService: RegisterEventService,
                private dialogRef: MatDialogRef<DetailsStepComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig) {
        super();

        this.rpgFormGroup = this.formBuilder.group({
            title: undefined,
            titleAbbreviation: undefined,
            firstname: undefined,
            surname: undefined,
        });

        this.newUser = <UserReq>data;

        this.registerEventService.getUserIdEmitter().subscribe(resp => this.idUser = resp);
    }

    ngAfterViewInit(): void {
        let sub = this.iconSelector!.selectionChange.subscribe(change => {
            this.result.profilePic = this.iconSelector!.selectedOptions.hasValue() ? this.iconSelector!.selectedOptions.selected[0].value : this.result.profilePic;
        });
        this.subscriptions.push(sub);
        this.createRPGForm()
    }

    clear() {
        this.rpgFormGroup.controls.title.setValue(undefined);
        this.rpgFormGroup.controls.titleAbbreviation.setValue(undefined);
        this.rpgFormGroup.controls.firstname.setValue(undefined);
        this.rpgFormGroup.controls.surname.setValue(undefined);
    }

    private createRPGForm() {
        this.rpgFormGroup = this.formBuilder.group({
            title: this.createFormControlTextLengthValidation(3, 50, ''),
            titleAbbreviation: this.createFormControlTextLengthValidation(3, 8, ''),
            firstname: this.createFormControlTextLengthValidation(3, 50, ''),
            surname: this.createFormControlTextLengthValidation(3, 50, '')
        });
        let sub = this.rpgFormGroup.valueChanges.subscribe(() => this.setRPGStuff());
        this.subscriptions.push(sub);
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

    setRPGStuff() {
        this.result.title = this.rpgFormGroup.controls.title.value;
        this.result.titleAbbreviation = this.rpgFormGroup.controls.titleAbbreviation.value;
        this.result.firstname = this.rpgFormGroup.controls.firstname.value;
        this.result.surname = this.rpgFormGroup.controls.surname.value;
        this.result.shipPrefix = undefined;
    }

    public cancel() {
        this.close(undefined);
    }

    public close(result?: InitialPlayerSettings) {
        this.dialogRef.close(result);
    }

    public confirm() {
        this.close(this.result);
    }

    @HostListener("keydown.esc")
    public onEsc() {
        this.close(undefined);
    }
}
