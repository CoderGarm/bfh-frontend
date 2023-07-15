import {Component, OnInit} from '@angular/core';
import {Fleet, FleetApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-fleet-movement-journal',
    templateUrl: './fleet-movement-journal.component.html',
    styleUrls: ['./fleet-movement-journal.component.scss']
})
export class FleetMovementJournalComponent extends SubscriptionManager implements OnInit {

    movingFleets: Fleet[] = [];

    constructor(private fleetService: FleetApiService) {
        super();
    }

    ngOnInit(): void {
        this.loadData();
    }

    private loadData() {
        let sub = this.fleetService.getMovingFleetsForUser().subscribe(resp => this.movingFleets = resp);
        this.subscriptions.push(sub);
    }
}
