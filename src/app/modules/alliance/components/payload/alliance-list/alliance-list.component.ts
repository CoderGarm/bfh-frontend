import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {Alliance, AllianceApiService} from "../../../../../services/swagger";

@Component({
    selector: 'app-alliance-list',
    templateUrl: './alliance-list.component.html',
    styleUrls: ['./alliance-list.component.scss']
})
export class AllianceListComponent extends SubscriptionManager implements OnInit {

    idAllianceUser?: number;
    alliances: Alliance[] = [];
    applicationOpenAt?: Alliance;

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {
        this.reload();
    }

    private reload() {
        let sub = this.allianceApi.getAlliances().subscribe(resp => this.alliances = resp);
        this.subscriptions.push(sub);
        sub = this.allianceApi.isApplicant().subscribe(resp => this.applicationOpenAt = resp);
        this.subscriptions.push(sub);
        this.idAllianceUser = this.tokenStorage.getAllianceID();
    }

    apply(alliance: Alliance) {
        this.allianceApi.applyForMembership(alliance.idAlliance).subscribe(resp => {
            if (resp) {
                this.reload();
            }
        });
    }
}
