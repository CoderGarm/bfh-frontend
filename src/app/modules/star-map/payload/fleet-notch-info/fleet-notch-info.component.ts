import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {StarMapCommunicationService} from "../../../../services/star-map-communication.service";

@Component({
    selector: 'app-fleet-notch-info',
    templateUrl: './fleet-notch-info.component.html',
    styleUrls: ['./fleet-notch-info.component.scss']
})
export class FleetNotchInfoComponent extends SubscriptionManager implements OnInit {

    commService: StarMapCommunicationService;

    constructor(commService: StarMapCommunicationService) {
        super();

        this.commService = commService;
    }

    ngOnInit(): void {
    }

}
