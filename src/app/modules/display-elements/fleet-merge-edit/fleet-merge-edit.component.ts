import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {Fleet, FleetMerge, WarShip} from "../../../services/swagger";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {StarMapCommunicationService} from "../../../services/star-map-communication.service";

@Component({
    selector: 'app-fleet-merge-edit',
    templateUrl: './fleet-merge-edit.component.html',
    styleUrls: ['./fleet-merge-edit.component.scss']
})
export class FleetMergeEditComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    fleets: Fleet[] = [];
    fleetsStorage: Map<number, WarShip[]> = new Map<number, WarShip[]>();

    /**
     * Just a number which can trigger the change detection.
     */
    @Input()
    resetChanges: number = 0;

    constructor(private commService: StarMapCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fleets']) {
            this.fleets = this.fleets.filter(f => f.owner.idUser === this.userId).sort((a, b) => b.ships.length - a.ships.length);
            this.fleets.forEach(fleet => {
                this.fleetsStorage.set(fleet.idFleet, fleet.ships.map(s => s));
            });
        }
        if (changes['resetChanges']) {
            this.fleets.forEach(fleet => {
                const warShips = this.fleetsStorage.get(fleet.idFleet);
                if (!!warShips) {
                    fleet.ships = warShips.map(s => s);
                }
            });
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
        this.fleets.forEach(fleet => {
            fm.fleetConstellations[fleet.idFleet] = fleet.ships.map(s => s.idWarship);
        });
        this.commService.setFleetConstellationForMerge(fm);
    }
}
