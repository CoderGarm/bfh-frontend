import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {UserApiService, UserSettings} from "../../../services/swagger";
import {FormBuilder, FormGroup} from "@angular/forms";
import {SnackbarNotificationService} from "../../../services/snackbar-notification.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends SubscriptionManager implements OnInit {

    static path: string = 'profile';

    role?: string;

    formGroup: FormGroup;

    private disabled: boolean = true;
    noEMailConfigPossible: boolean = true;

    constructor(private formBuilder: FormBuilder,
                private notif: SnackbarNotificationService,
                private userService: UserApiService) {
        super();

        this.formGroup = this.formBuilder.group({
            receiveChangelogInfos: false,
            eMailVerified: false,
            noEMailWanted: false,
        });
        this.formGroup.controls.eMailVerified.disable({onlySelf: true});
        this.formGroup.controls.noEMailWanted.disable({onlySelf: true});

        this.formGroup.valueChanges.subscribe(val => {
            if (!this.disabled) {
                const userSettings = <UserSettings>val;
                let sub = this.userService.changeSettings(userSettings).subscribe(() => {
                    this.notif.short('saved');
                });
                this.subscriptions.push(sub);
            }
        });
    }

    ngOnInit(): void {
        this.role = this.tokenStorage.getRole();
        let sub = this.userService.getSettings().subscribe(resp => {
            const eMailVerified = resp.eMailVerified;
            const noEMailWanted = resp.noEMailWanted;
            this.noEMailConfigPossible = !eMailVerified && noEMailWanted;
            console.log(this.noEMailConfigPossible, !eMailVerified, noEMailWanted);

            this.formGroup.controls.receiveChangelogInfos.setValue(resp.receiveChangelogInfos);
            if (this.noEMailConfigPossible) {
                this.formGroup.controls.receiveChangelogInfos.disable({onlySelf: true});
            } else {
                this.formGroup.controls.receiveChangelogInfos.enable();
            }
            this.formGroup.controls.eMailVerified.setValue(eMailVerified);
            this.formGroup.controls.noEMailWanted.setValue(noEMailWanted);
            this.disabled = false;
        });
        this.subscriptions.push(sub);
    }
}
