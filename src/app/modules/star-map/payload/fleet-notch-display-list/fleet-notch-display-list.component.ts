import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {StarMapCommunicationService} from "../../../../services/star-map-communication.service";
import {Fleet} from "../../../../services/swagger";

@Component({
    selector: 'app-fleet-notch-display-list',
    templateUrl: './fleet-notch-display-list.component.html',
    styleUrls: ['./fleet-notch-display-list.component.scss']
})
export class FleetNotchDisplayListComponent extends SubscriptionManager implements OnInit {

    commService: StarMapCommunicationService;

    constructor(commService: StarMapCommunicationService) {
        super();

        this.commService = commService;
    }

    ngOnInit(): void {
    }

    getColSpan(fleet: Fleet) {
        let result: number = 3;
        const length = this.commService.selectedFleets.length;
        const indexOf = this.commService.selectedFleets.indexOf(fleet) + 1;

        const currentRow = Math.ceil(indexOf / 3);

        const diff = length - (currentRow * 3);
        const elementsInLastRow = 3 - -diff;
        if (diff < 0) {
            result = 6 / elementsInLastRow;
        } else {
            result = 2;
        }
        return result;
    }
}
