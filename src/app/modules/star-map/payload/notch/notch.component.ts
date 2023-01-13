import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {StarMapCommunicationService} from "../../../../star-map-communication.service";
import {FleetApiService} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../SubscriptionManager";


@Component({
    selector: 'app-notch',
    templateUrl: './notch.component.html',
    styleUrls: ['./notch.component.scss']
})
export class NotchComponent extends SubscriptionManager implements OnInit, OnChanges, OnDestroy {

    @Input()
    stellarMode: boolean = false;

    commService: StarMapCommunicationService;
    displayMove: boolean = false;
    displayInfo: boolean = false;
    displayMerge: boolean = false;
    displayTransport: boolean = false;

    constructor(private fleetService: FleetApiService,
                commService: StarMapCommunicationService) {
        super();
        this.commService = commService;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    displayActive(): boolean {
        return !this.displayInfo && !this.displayMove && !this.displayMerge && !this.displayTransport;
    }

    deselect() {
        this.commService.deselect();
        this.displayInfo = false;
        this.displayMove = false;
        this.displayMerge = false;
        this.displayTransport = false;
    }

    toggleShowMove() {
        if (!this.showMoveDisabled()) {
            this.displayMove = !this.displayMove;
        }
    }

    toggleShowMerge() {
        if (!this.showMergeDisabled()) {
            this.displayMerge = !this.displayMerge;
        }
    }

    toggleShowTransport() {
        if (!this.showTransportDisabled()) {
            this.displayTransport = !this.displayTransport;
        }
    }

    showInfoDisabled() {
        return this.commService.infoDisabled();
    }

    showMoveDisabled() {
        return this.commService.showMoveDisabled() && this.cancelMoveDisabled();
    }


    showMergeDisabled() {
        return !this.stellarMode || this.commService.showMergeDisabled();
    }

    showTransportDisabled() {
        return !this.stellarMode || this.commService.showTransportDisabled();
    }

    foreignSelected() {
        return this.commService.selectedFleets.filter(f => f.owner.idUser !== this.userId).length > 0;
    }

    deselectDisabled() {
        return this.commService.deselectDisabled();
    }

    cancelMoveDisabled() {
        return !this.stellarMode || this.commService.showCancelMoveDisabled();
    }

    ngOnDestroy(): void {
        this.commService.clear();
    }

    toggleShowInfo() {
        if (!this.showInfoDisabled()) {
            this.displayInfo = !this.displayInfo;
        }
    }
}
