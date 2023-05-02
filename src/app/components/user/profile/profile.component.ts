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

    constructor(private formBuilder: FormBuilder,
                private notif: SnackbarNotificationService,
                private userService: UserApiService) {
        super();

        this.formGroup = this.formBuilder.group({
            receiveChangelogInfos: false,
        });
        this.formGroup.valueChanges.subscribe(val => {
            const userSettings = <UserSettings>val;
            let sub = this.userService.changeSettings(userSettings).subscribe(() => {
                this.notif.short('saved');
            });
            this.subscriptions.push(sub);
        });
    }

    ngOnInit(): void {
        this.role = this.tokenStorage.getRole();
    }
}
