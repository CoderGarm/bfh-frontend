import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {Alliance, AllianceApiService} from "../../../../../services/swagger";

@Component({
    selector: 'app-alliance-list',
    templateUrl: './alliance-list.component.html',
    styleUrls: ['./alliance-list.component.scss']
})
export class AllianceListComponent extends SubscriptionManager implements OnInit {

    alliances: Alliance[] = [];

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.allianceApi.getAlliances().subscribe(resp => this.alliances = resp);
        this.subscriptions.push(sub);
    }

}
