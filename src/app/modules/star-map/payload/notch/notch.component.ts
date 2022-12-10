import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {StarMapCommunicationService} from "../../../../star-map-communication.service";


@Component({
    selector: 'app-notch',
    templateUrl: './notch.component.html',
    styleUrls: ['./notch.component.scss']
})
export class NotchComponent implements OnInit, OnChanges, OnDestroy {

    @Input()
    stellarMode: boolean = false;

    commService: StarMapCommunicationService;

    constructor(commService: StarMapCommunicationService) {
        this.commService = commService;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    deselect() {
        this.commService.deselect();
    }

    move() {
        if (this.stellarMode) {
            this.commService.stellarMove();
        } else {
            this.commService.interstellarMove();
        }
    }

    merge() {
        this.commService.merge();
    }

    moveDisabled() {
        return this.commService.moveDisabled();
    }

    mergeDisabled() {
        return !this.stellarMode || this.commService.mergeDisabled();
    }

    deselectDisabled() {
        return !this.commService.isSelectedFleetMarker();
    }

    cancelDisabled() {
        return !this.stellarMode || this.commService.cancelDisabled();
    }

    ngOnDestroy(): void {
        this.commService.clear();
    }

    cancel() {
        this.commService.cancel();
    }
}
