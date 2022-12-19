import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../SubscriptionManager";
import {Fleet, FleetMerge, WarShip} from "../../../services/swagger";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {StarMapCommunicationService} from "../../../star-map-communication.service";

@Component({
    selector: 'app-fleet-merge-edit',
    templateUrl: './fleet-merge-edit.component.html',
    styleUrls: ['./fleet-merge-edit.component.scss']
})
export class FleetMergeEditComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    fleetSubject?: Fleet;
    fleetSubjectShips?: WarShip[];

    @Input()
    fleetObject?: Fleet;
    fleetObjectShips?: WarShip[];

    @Input()
    resetChanges: number = 0;

    constructor(private commService: StarMapCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fleetSubject']) {
            this.fleetSubjectShips = this.fleetSubject?.ships.map(s => s);
        }
        if (changes['fleetObject']) {
            this.fleetObjectShips = this.fleetObject?.ships.map(s => s);

        }
        if (changes['resetChanges']) {
            if (!!this.fleetSubject && !!this.fleetSubjectShips) {
                this.fleetSubject.ships = this.fleetSubjectShips.map(s => s);
            }
            if (!!this.fleetObject && !!this.fleetObjectShips) {
                this.fleetObject.ships = this.fleetObjectShips.map(s => s);
            }
        }
    }

    drop(event: CdkDragDrop<WarShip[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
        let fm: FleetMerge = {
            fleetConstellations: {}
        }
        fm.fleetConstellations[this.fleetSubject!.idFleet!] = this.fleetSubject!.ships.map(s => s.idWarship);
        fm.fleetConstellations[this.fleetObject!.idFleet!] = this.fleetObject!.ships.map(s => s.idWarship);
        this.commService.setFleetConstellationForMerge(fm);
    }
}
