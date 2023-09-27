import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractId, Fleet, FleetApiService, FleetFormationMultiAction, FleetMerge, FleetOrbit, FleetSplit, PlanetApiService, WarShip} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";

interface FleetContainer {
    idFleet: number,
    name: string,
    ships: WarShip[]
}


@Component({
    selector: 'app-fleet-detachment',
    templateUrl: './fleet-detachment.component.html',
    styleUrls: ['./fleet-detachment.component.scss']
})
export class FleetDetachmentComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    fleet?: Fleet;
    shipsInOriginalFleet: number[] = [];

    fleets: FleetContainer[] = [];

    fleetSplit: FleetSplit = {fleetConstellations: {}, orbit: {}};
    shipsForPool: number[] = [];
    fleetMerge: FleetMerge = {
        fleetConstellations: {}
    }

    pooledShips: WarShip[] = [];

    runningInteger: number = -2;

    changeHappened: boolean = false;

    private static readonly POOL_FLEET_NAME: string = 'POOL';
    public static readonly POOL_FLEET_ID: number = -Number.MAX_VALUE;
    private coords?: FleetOrbit;

    constructor(private fleetService: FleetApiService,
                private fleetCommService: FleetEventService,
                private planetService: PlanetApiService,
                private notif: SnackbarNotificationService) {
        super();

        let sub = this.fleetCommService.getRetireFleetEmitter().subscribe(fleet => this.fetchBaseData());
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        this.fetchPooledShips();
        this.fetchMainPlanetOrbit();
    }

    private fetchMainPlanetOrbit() {
        let sub = this.planetService.getMainPlanetCoords().subscribe(resp => this.coords = resp);
        this.subscriptions.push(sub);
    }

    private fetchPooledShips() {
        let sub = this.fleetService.getPooledWarships().subscribe(resp => {
            this.pooledShips = resp;
            this.fleets.filter(f => f.idFleet === FleetDetachmentComponent.POOL_FLEET_ID).forEach(f => f.ships = this.pooledShips.map(w => w));
        });
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fleet']) {
            this.setupFleet(this.fleet);
        }
    }

    private setupFleet(fleet?: Fleet) {
        this.fleets = [];
        this.shipsInOriginalFleet = [];
        this.createPoolFleet();

        if (!!fleet) {
            this.fleets.push({
                idFleet: fleet.idFleet,
                name: fleet.name,
                ships: fleet.ships
            });
            this.shipsInOriginalFleet.push(...fleet.ships.map(s => s.idWarship));
        }
        this.addFleetContainer();
    }

    private createPoolFleet() {
        this.fleets.push({
            idFleet: FleetDetachmentComponent.POOL_FLEET_ID,
            name: FleetDetachmentComponent.POOL_FLEET_NAME,
            ships: this.pooledShips.map(w => w)
        });
    }

    private isPooledShip(w: WarShip) {
        return this.pooledShips.filter(p => p.idWarship === w.idWarship).length > 0;
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
        this.changeHappened = true;
    }

    addFleetContainer() {
        this.runningInteger--;
        this.fleets.push({
            idFleet: this.runningInteger,
            name: '',
            ships: []
        })
    }

    removeFleetContainer() {
        const length = this.fleets.length;
        this.fleets.splice(length - 1, 1)
    }

    submit() {
        const orbit = !!this.fleet && !!this.fleet.orbit ? this.fleet.orbit : this.coords!;
        this.fleetSplit = {fleetConstellations: {}, orbit: orbit};
        this.shipsForPool = [];
        this.fleetMerge = {
            fleetConstellations: {}
        }
        this.fleets
            .filter(f => !!f.name && f.ships.length > 0)
            .filter(f => f.idFleet != this.fleet?.idFleet)
            .forEach(fleet => {
                if (fleet.idFleet === FleetDetachmentComponent.POOL_FLEET_ID) {
                    this.shipsForPool = fleet.ships.filter(s => !this.isPooledShip(s)).map(s => s.idWarship);
                } else {
                    this.fleetSplit.fleetConstellations[fleet.name + fleet.idFleet] = fleet.ships.map(s => s.idWarship);
                }
            });

        this.setupShipsForChosenFleet();

        const request: FleetFormationMultiAction = {
            fleetMerge: this.fleetMerge,
            fleetSplit: this.fleetSplit,
            shipsToPool: this.shipsForPool
        }

        let sub = this.fleetService.multiActionFleetFormation(request).subscribe(resp => {
            this.notifyNewFleet(resp.splitResult);
            this.afterDetachAction();
        });
        this.subscriptions.push(sub);
    }

    private setupShipsForChosenFleet() {
        if (!!this.fleet) {
            const newShipsForFleet: WarShip[] = this.fleets
                .filter(fc => fc.idFleet === this.fleet!.idFleet)[0]
                .ships
                .filter(shipInContainer => !this.shipsInOriginalFleet.includes(shipInContainer.idWarship));
            if (newShipsForFleet.length > 0) {
                this.fleetMerge.fleetConstellations[this.fleet!.idFleet] = newShipsForFleet.map(s => s.idWarship);
            }
        }
    }

    private notifyNewFleet(fleets: Fleet[]) {
        let separatedFleets: AbstractId[] = fleets.map(f => <AbstractId>{
            id: f.idFleet,
            name: f.name
        });
        separatedFleets.forEach(sf => this.fleetCommService.changeName({
            id: sf.id,
            name: sf.name!
        }));
    }

    private afterDetachAction() {
        this.notif.open('Fleets detached');
        this.fetchBaseData();
        this.fleetCommService.selectFleet({id: this.fleet!.idFleet});
    }

    private fetchBaseData() {
        this.reFetchFleet();
        this.fetchPooledShips();
    }

    reFetchFleet() {
        if (!!this.fleet) {
            let sub = this.fleetService.getFleet(this.fleet.idFleet).subscribe(resp => this.setupFleet(resp));
            this.subscriptions.push(sub);
        }
    }

    allValid() {
        if (!this.changeHappened) {
            return false;
        }
        return this.fleets.filter(f => f.ships.length > 0).filter(f => !f.name || f.name.trim().length == 0).length == 0;
    }
}
