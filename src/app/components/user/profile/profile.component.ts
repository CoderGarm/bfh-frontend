import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {UserApiService, UserSettings} from "../../../services/swagger";
import {FormBuilder, FormGroup} from "@angular/forms";
import {SnackbarNotificationService} from "../../../services/snackbar-notification.service";
import {MatSelectionList} from "@angular/material/list";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends SubscriptionManager implements OnInit, AfterViewInit {

    role?: string;

    eMailFormGroup: FormGroup;

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
                private notif: SnackbarNotificationService,
                private userService: UserApiService) {
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
    }

    ngOnInit(): void {
        this.role = this.tokenStorage.getRole();
        let sub = this.userService.getSettings().subscribe(resp => {
            this.userSetting = resp;
            const eMailVerified = resp.eMailVerified;
            const noEMailWanted = resp.noEMailWanted;
            this.noEMailConfigPossible = !eMailVerified && noEMailWanted;

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
}
