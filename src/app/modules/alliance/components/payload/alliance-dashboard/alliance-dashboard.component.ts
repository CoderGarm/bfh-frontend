import {Component, Input, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {Alliance, AllianceApiService} from "../../../../../services/swagger";

@Component({
    selector: 'app-alliance-dashboard',
    templateUrl: './alliance-dashboard.component.html',
    styleUrls: ['./alliance-dashboard.component.scss']
})
export class AllianceDashboardComponent extends SubscriptionManager implements OnInit {

    @Input()
    alliance?: Alliance;

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {

    }

}
