import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {StarMapCommunicationService} from "../../../../star-map-communication.service";
import {Fleet, FleetApiService} from "../../../../services/swagger";
import {MatDialog} from "@angular/material/dialog";
import {SubscriptionManager} from "../../../../SubscriptionManager";


@Component({
    selector: 'app-notch',
    templateUrl: './notch.component.html',
    styleUrls: ['./notch.component.scss']
})
export class NotchComponent extends SubscriptionManager implements OnInit, OnChanges, OnDestroy {

    @Input()
    stellarMode: boolean = false;

    deselectAllMovements: number = 0;
    resetMergeChanges: number = 0

    commService: StarMapCommunicationService;
    displayMove: boolean = false;
    displayInfo: boolean = false;
    displayMerge: boolean = false;
    displayTransport: boolean = false;

    constructor(private dialog: MatDialog,
                private fleetService: FleetApiService,
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

    showInfoDisabled() {
        return this.commService.infoDisabled();
    }

    showMoveDisabled() {
        return this.commService.showMoveDisabled() && this.cancelMoveDisabled();
    }

    executeMoveDisabled() {
        return this.commService.executeMoveDisabled() && this.commService.executeCancelDisabled();
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
