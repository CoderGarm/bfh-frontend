import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {StarMapCommunicationService} from "../../../../services/intercom/star-map-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";

enum NotchType {
    info = 'info',
    move = 'move',
    merge = 'merge',
    transport = 'transport'
}

@Component({
    selector: 'app-notch',
    templateUrl: './notch.component.html',
    styleUrls: ['./notch.component.scss']
})
export class NotchComponent extends SubscriptionManager implements OnInit, OnChanges, OnDestroy {

    @Input()
    stellarMode: boolean = false;

    displayMove: boolean = false;
    displayInfo: boolean = false;
    displayMerge: boolean = false;
    displayTransport: boolean = false;
    notchType?: string = undefined;

    constructor(protected commService: StarMapCommunicationService) {
        super();
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
        this.undisplayNotchElement(false, false, false, false);
    }

    private undisplayNotchElement(displayInfo: boolean, displayMove: boolean, displayMerge: boolean, displayTransport: boolean) {
        this.displayInfo = displayInfo;
        this.displayMove = displayMove;
        this.displayMerge = displayMerge;
        this.displayTransport = displayTransport;
    }

    toggleNotchElement() {
        if (!!this.notchType) {
            let key: NotchType = NotchType[this.notchType as keyof typeof NotchType];

            switch (key) {
                case undefined:
                    this.undisplayNotchElement(false, false, false, false);
                    break;
                case NotchType.info:
                    this.undisplayNotchElement(!this.displayInfo, false, false, false);
                    break;
                case NotchType.move:
                    this.undisplayNotchElement(false, !this.displayMove, false, false);
                    break;
                case NotchType.merge:
                    this.undisplayNotchElement(false, false, !this.displayMerge, false);
                    break;
                case NotchType.transport:
                    this.undisplayNotchElement(false, false, false, !this.displayTransport);
                    break;
                default:
                    throw new Error("You missed something to implement!");
            }
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
}
