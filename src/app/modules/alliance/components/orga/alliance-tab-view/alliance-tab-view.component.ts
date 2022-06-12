import {Component, OnInit} from '@angular/core';
import {Alliance, AllianceApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";

@Component({
    selector: 'app-alliance-tab-view',
    templateUrl: './alliance-tab-view.component.html',
    styleUrls: ['./alliance-tab-view.component.scss']
})
export class AllianceTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = "alliance";

    actionTabTitles: string[] = ['List', 'Dashboard', 'Forum'];

    alliance?: Alliance;

    constructor(private allianceApi: AllianceApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.allianceApi.getAllianceForUser().subscribe(resp => this.alliance = resp);
        this.subscriptions.push(sub);
    }

}
