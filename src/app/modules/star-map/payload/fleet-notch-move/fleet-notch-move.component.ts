import {Component, Input, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {StarMapCommunicationService} from "../../../../services/star-map-communication.service";

@Component({
    selector: 'app-fleet-notch-move',
    templateUrl: './fleet-notch-move.component.html',
    styleUrls: ['./fleet-notch-move.component.scss']
})
export class FleetNotchMoveComponent extends SubscriptionManager implements OnInit {

    @Input()
    stellarMode: boolean = false;

    commService: StarMapCommunicationService;

    deselectAllMovements: number = 0;

    constructor(commService: StarMapCommunicationService) {
        super();

        this.commService = commService;
    }

    ngOnInit(): void {
    }

    executeMove() {
        if (this.stellarMode) {
            this.commService.stellarMove();
        } else {
            this.commService.interstellarMove();
        }
    }

    deselectMovements() {
        this.deselectAllMovements++;
    }

    executeMoveDisabled() {
        return this.commService.executeMoveDisabled() && this.commService.executeCancelDisabled();
    }
}
