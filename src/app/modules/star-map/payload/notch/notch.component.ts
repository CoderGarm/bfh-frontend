import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {StarMapCommunicationService} from "../../../../services/intercom/star-map-communication.service";
import {SubscriptionManager} from "../../../../subscription.manager";

export enum ENotchType {
    INFO = 'INFO',
    MOVE = 'MOVE',
    MERGE = 'MERGE',
    TRANSPORT = 'TRANSPORT'
}

@Component({
    selector: 'app-notch',
    templateUrl: './notch.component.html',
    styleUrls: ['./notch.component.scss']
})
export class NotchComponent extends SubscriptionManager implements OnInit, OnChanges, OnDestroy {

    displayMove: boolean = false;
    displayInfo: boolean = false;
    displayMerge: boolean = false;
    displayTransport: boolean = false;
    notchType?: string = undefined;

    constructor(protected commService: StarMapCommunicationService) {
        super();

        let sub = this.commService.getRadialMenuEmitter().subscribe(event => {
            if (event == 'DESELECT') {
                this.deselect();
            } else {
                this.notchType = <ENotchType><unknown>event;
                this.toggleNotchElement();
            }
        });
        this.subscriptions.push(sub);
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
            let key: ENotchType = ENotchType[this.notchType as keyof typeof ENotchType];

            switch (key) {
                case undefined:
                    this.undisplayNotchElement(false, false, false, false);
                    break;
                case ENotchType.INFO:
                    this.undisplayNotchElement(!this.displayInfo, false, false, false);
                    break;
                case ENotchType.MOVE:
                    this.undisplayNotchElement(false, !this.displayMove, false, false);
                    break;
                case ENotchType.MERGE:
                    this.undisplayNotchElement(false, false, !this.displayMerge, false);
                    break;
                case ENotchType.TRANSPORT:
                    this.undisplayNotchElement(false, false, false, !this.displayTransport);
                    break;
                default:
                    throw new Error("You missed something to implement!");
            }
        }
    }

    ngOnDestroy(): void {
        this.commService.clear();
    }

    actionPossible() {
        const isMoveDisabled = this.commService.showMoveDisabled() && this.commService.showCancelMoveDisabled();
        return this.commService.foreignSelected() || !this.commService.infoDisabled() || !isMoveDisabled || !this.commService.showMergeDisabled() || !this.commService.showTransportDisabled();
    }
}
