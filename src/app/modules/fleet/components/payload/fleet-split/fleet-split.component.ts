import {AfterViewInit, Component, Input, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetSplit, WarShip} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";

interface FleetContainer {
    idFleet: number,
    name: string,
    ships: WarShip[]
}


@Component({
    selector: 'app-fleet-split',
    templateUrl: './fleet-split.component.html',
    styleUrls: ['./fleet-split.component.scss']
})
export class FleetSplitComponent extends SubscriptionManager implements AfterViewInit {

    @Input()
    fleet?: Fleet;

    fleets: FleetContainer[] = [];

    fleetSplit: FleetSplit = {fleetConstellations: {}}

    locked: number[] = [];

    constructor(private fleetService: FleetApiService,
                private fleetChangeService: FleetEventService) {
        super();
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fleet'] && !!this.fleet) {

            this.fleets = [];
            const f = this.fleet;
            this.locked.push(f.idFleet);
            this.fleets.push({
                idFleet: f.idFleet,
                name: f.name,
                ships: f.ships
            });
            this.addFleetContainer();
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
        this.fleetSplit = {fleetConstellations: {}}
        this.fleets.forEach(fleet => {
            this.fleetSplit.fleetConstellations[fleet.name] = fleet.ships.map(s => s.idWarship);
        });
    }

    addFleetContainer() {
        this.fleets.push({
            idFleet: -this.fleets.length,
            name: '',
            ships: []
        })
    }

    removeFleetContainer() {
        const length = this.fleets.length;
        this.fleets.splice(length - 1, 1)
    }

    submit() {
        // fixme hier weiter
    }
}
