import {Component, OnInit} from '@angular/core';
import {AllianceApiService} from "../../../../../services/swagger";
import {FormControl, FormGroup} from "@angular/forms";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";

@Component({
    selector: 'app-alliance-create',
    templateUrl: './alliance-create.component.html',
    styleUrls: ['./alliance-create.component.scss']
})
export class AllianceCreateComponent extends SubscriptionManager implements OnInit {

    allianceG: FormGroup = new FormGroup({
        allianceNameFC: new FormControl(''),
        allianceCodeFC: new FormControl('')
    })

    constructor(private allianceApi: AllianceApiService, private snackbarService: SnackbarNotificationService) {
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
            }
        });
        this.subscriptions.push(sub);
    }
}
