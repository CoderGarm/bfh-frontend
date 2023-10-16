import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {
    AbstractId,
    Fleet,
    FleetApiService,
    FleetFormationMultiAction,
    FleetMerge,
    FleetOrbit,
    FleetSplit,
    Planet,
    PlanetApiService,
    ResourceDeposit,
    ResourcesApiService,
    WarShip
} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {ModuleService} from "../../../../../services/prefetch/module.service";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {NgxSpinnerService} from "ngx-spinner";
import {ReplaySubject} from "rxjs";

interface FleetContainer {
    idFleet: number,
    name: string,
    ships: WarshipContainer[]
}

interface WarshipContainer {
    idFleet?: number,
    warship: WarShip,
    isOperational: boolean,
    isPool: boolean
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

    @Input()
    planet?: Planet;

    @Input()
    isFleetCreation: boolean = false;

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
    planets: Planet[] = [];
    deposit?: ResourceDeposit;

    costsByShipClass: Map<number, ReplaySubject<ResourceDeposit>> = new Map<number, ReplaySubject<ResourceDeposit>>();

    constructor(private spinner: NgxSpinnerService,
                private fleetService: FleetApiService,
                private fleetCommService: FleetEventService,
                private planetService: PlanetApiService,
                private resourceService: ResourcesApiService,
                private moduleService: ModuleService,
                private notif: SnackbarNotificationService) {
        super();

        let sub = this.fleetCommService.getRetireFleetEmitter().subscribe(() => this.fetchBaseData());
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
        this.showSpinner();
        this.fetchPooledShips();
        this.fetchMainPlanetOrbit();
        let sub = this.planetService.getPlanetByUsers().subscribe(resp => {
            this.planets = resp;
            if (this.isFleetCreation) {
                this.setVenue(this.planets.filter(p => p.isMain)[0]!);
                this.hideSpinner();
            }
        });
        this.subscriptions.push(sub);
    }

    private hideSpinner() {
        this.spinner.hide('detachment-spinner');
    }

    private showSpinner() {
        this.spinner.show('detachment-spinner'); /* fixme spinner logic open and close by event type? if no events running just close */
    }

    private fetchMainPlanetOrbit() {
        let sub = this.planetService.getMainPlanetCoords().subscribe(resp => this.coords = resp);
        this.subscriptions.push(sub);
    }

    private fetchPooledShips() {
        this.showSpinner();
        if (!this.planet) {
            this.pooledShips = [];
            this.populizePoolFleetContainer();
            this.hideSpinner();
            return;
        }
        let sub = this.fleetService.getPooledWarships(this.planet.idPlanet).subscribe(resp => {
            this.pooledShips = resp;
            this.pooledShips.forEach(ship => this.addShipClassCosts(ship));
            this.populizePoolFleetContainer();
            this.hideSpinner();
        });
        this.subscriptions.push(sub);
    }

    private addShipClassCosts(ship: WarShip) {
        const idShipClass = ship.shipClass.idShipClass!;
        this.costsByShipClass.set(idShipClass, this.moduleService.getShipClassCosts(idShipClass));
    }

    private populizePoolFleetContainer() {
        this.fleets.filter(f => f.idFleet === FleetDetachmentComponent.POOL_FLEET_ID).forEach(f => f.ships = this.mapPooledShips(this.pooledShips));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fleet']) {
            this.setupFleet(this.fleet);
        }
        if (changes['planet'] && !!this.planet) {
            this.setVenue(this.planet);
        }
    }

    setVenue(event: Planet) {
        this.planet = event;
        this.fetchPooledShips();
        this.fetchPopDeposit();
    }

    private fetchPopDeposit() {
        this.showSpinner();
        if (!this.planet) {
            this.deposit = undefined;
            this.hideSpinner();
            return;
        }
        let sub = this.resourceService.getResourceDeposit(this.planet.idPlanet).subscribe(resp => {
            this.deposit = resp;
            this.hideSpinner();
        });
        this.subscriptions.push(sub);
    }

    private setupFleet(fleet?: Fleet) {
        this.fleets = [];
        this.shipsInOriginalFleet = [];
        this.createPoolFleet();

        if (!!fleet) {
            this.fleets.push({
                idFleet: fleet.idFleet,
                name: fleet.name,
                ships: fleet.ships.map(w => <WarshipContainer>{
                    warship: w,
                    idFleet: fleet.idFleet,
                    isOperational: w.warshipHealthState.state.isActive && w.warshipHealthState.state.isOperational
                })
            });
            this.shipsInOriginalFleet.push(...fleet.ships.map(s => s.idWarship));
            fleet.ships.forEach(ship => this.addShipClassCosts(ship));
        }
        this.addFleetContainer();
    }

    private createPoolFleet() {
        this.fleets.push({
            idFleet: FleetDetachmentComponent.POOL_FLEET_ID,
            name: FleetDetachmentComponent.POOL_FLEET_NAME,
            ships: this.mapPooledShips(this.pooledShips)
        });
    }

    private mapPooledShips(pooledShips: WarShip[]) {
        return pooledShips.map(w => <WarshipContainer>{
            warship: w,
            isPool: true,
            isOperational: w.warshipHealthState.state.isActive && w.warshipHealthState.state.isOperational
        });
    }

    private isPooledShip(w: WarShip | WarshipContainer) {
        if ('isPool' in w) {
            return w.isPool;
        }
        return this.pooledShips.filter(p => p.idWarship === w.idWarship).length > 0;
    }

    drop(event: CdkDragDrop<WarshipContainer[]>) {
        console.log(event.previousContainer)
        console.log(event.container)
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
                    this.shipsForPool = fleet.ships.filter(s => !this.isPooledShip(s)).map(s => s.warship.idWarship);
                } else {
                    this.fleetSplit.fleetConstellations[fleet.name + fleet.idFleet] = fleet.ships.map(s => s.warship.idWarship);
                }
            });

        this.setupShipsForChosenFleet();

        const request: FleetFormationMultiAction = {
            fleetMerge: Object.keys(this.fleetMerge.fleetConstellations).length > 0 ? this.fleetMerge : undefined,
            fleetSplit: Object.keys(this.fleetSplit.fleetConstellations).length > 0 ? this.fleetSplit : undefined,
            shipsToPool: this.shipsForPool,
            orderInoperational: this.fleets.map(fc => fc.ships).flatMap(s => s).filter(c => !c.isOperational).map(c => c.warship.idWarship),
            orderOperational: this.fleets.map(fc => fc.ships).flatMap(s => s).filter(c => c.isOperational).map(c => c.warship.idWarship)
        }

        let sub = this.fleetService.multiActionFleetFormation(request).subscribe(resp => {
            this.notifyNewFleet(resp.splitResult);
            this.afterDetachAction();
        });
        this.subscriptions.push(sub);
    }

    private setupShipsForChosenFleet() {
        if (!!this.fleet) {
            const newShipsForFleet: WarshipContainer[] = this.fleets
                .filter(fc => fc.idFleet === this.fleet!.idFleet)[0]
                .ships
                .filter(shipInContainer => !this.shipsInOriginalFleet.includes(shipInContainer.warship.idWarship));
            if (newShipsForFleet.length > 0) {
                this.fleetMerge.fleetConstellations[this.fleet!.idFleet] = newShipsForFleet.map(s => s.warship.idWarship);
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

    isStateChangePossible(isActive: boolean, costs: ResourceDeposit | null) {
        if (!costs || !this.deposit) {
            return false;
        }
        if (isActive) {
            return true;
        }
        return ResourceHelper.canPayTheBill(costs, this.deposit, true);
    }

    changeOperationalState(container: WarshipContainer) {
        const isOperational = container.isOperational;
        this.changeHappened = true;

        let sub = this.costsByShipClass.get(container.warship.shipClass.idShipClass!)!
            .subscribe(costs => {
                if (!!costs && !!this.deposit) {
                    if (!isOperational && ResourceHelper.canPayTheBill(costs, this.deposit, true)) {
                        // to ship
                        container.isOperational = !isOperational;
                        this.deposit = ResourceHelper.reduceTheBill(costs, this.deposit);
                    } else {
                        // to planet
                        container.isOperational = !isOperational;
                        this.deposit = ResourceHelper.addToBill(costs, this.deposit);
                    }
                }
            });
        this.subscriptions.push(sub);
    }
}
