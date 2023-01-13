import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {StarMapCommunicationService} from "../../../../star-map-communication.service";

@Component({
    selector: 'app-fleet-notch-merge',
    templateUrl: './fleet-notch-merge.component.html',
    styleUrls: ['./fleet-notch-merge.component.scss']
})
export class FleetNotchMergeComponent extends SubscriptionManager implements OnInit {

    commService: StarMapCommunicationService;

    resetMergeChanges: number = 0

    constructor(commService: StarMapCommunicationService) {
        super();

        this.commService = commService;
    }

    ngOnInit(): void {
    }

    executeMerge() {
        this.commService.executeMerge();
    }

    executeMergeDisabled() {
        return this.commService.mergeDisabled()
    }


    resetMerge() {
        this.commService.resetMerge();
        this.resetMergeChanges++;
    }
}
