import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {StarMapCommunicationService} from "../../../../star-map-communication.service";
import {Fleet, FleetApiService} from "../../../../services/swagger";
import {MatDialog} from "@angular/material/dialog";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";


@Component({
    selector: 'app-notch',
    templateUrl: './notch.component.html',
    styleUrls: ['./notch.component.scss']
})
export class NotchComponent implements OnInit, OnChanges, OnDestroy {

    @Input()
    stellarMode: boolean = false;

    deselectAllMovements: number = 0;
    resetMergeChanges: number = 0

    commService: StarMapCommunicationService;
    displayMove: boolean = false;
    displayInfo: boolean = false;
    displayMerge: boolean = false;

    constructor(private dialog: MatDialog,
                private tokenStorage: TokenStorage,
                private fleetService: FleetApiService,
                commService: StarMapCommunicationService) {
        this.commService = commService;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    deselect() {
        this.commService.deselect();
        this.displayInfo = false;
        this.displayMove = false;
        this.displayMerge = false;
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
        return this.commService.showMergeDisabled();
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
