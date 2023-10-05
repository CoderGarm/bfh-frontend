import {Component, OnInit} from '@angular/core';
import {AllianceApiService, JWT} from "../../../../../services/swagger";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {AllianceErrorMessages} from "../../../validators/alliance.validator";
import {AllianceNotificationService} from "../../../alliance-notification.service";
import GameUserRolesEnum = JWT.GameUserRolesEnum;

@Component({
    selector: 'app-alliance-create',
    templateUrl: './alliance-create.component.html',
    styleUrls: ['./alliance-create.component.scss']
})
export class AllianceCreateComponent extends SubscriptionManager implements OnInit {

    errors = AllianceErrorMessages;

    allianceG: FormGroup = new FormGroup({
        allianceNameFC: new FormControl('', Validators.required),
        allianceCodeFC: new FormControl('', Validators.required)
    });

    constructor(private allianceApi: AllianceApiService,
                private allyNotificationService: AllianceNotificationService,
                private snackbarService: SnackbarNotificationService) {
        super();
    }

    ngOnInit(): void {
    }

    create() {
        let name = this.allianceG.controls.allianceNameFC.value;
        let code = this.allianceG.controls.allianceCodeFC.value;
        let sub = this.allianceApi.createAlliance(name, code).subscribe(resp => {
            if (!!resp) {
                this.snackbarService.open("You founded the alliance " + resp.name + " [" + resp.code + "]");
                this.allyNotificationService.pushCreation();
                const gameRoles = this.tokenStorage.getGameRoles();
                gameRoles.push(GameUserRolesEnum.ALLIANCE_ADMIN)
                this.tokenStorage.setGameRoles(gameRoles)
            }
        });
        this.subscriptions.push(sub);
    }
}
