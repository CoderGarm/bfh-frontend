import {SubscriptionManager} from "./SubscriptionManager";
import {EventEmitter, Injectable} from "@angular/core";
import {Distance, Fleet, FleetApiService, FleetMarker, FleetMove, FleetOrbit, Orbit, Planet, StarSystem} from "./services/swagger";
import {NavigationCalculator} from "./NavigationCalculator";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

@Injectable()
export class StarMapCommunicationService extends SubscriptionManager {

    private displayStarSystemEmitter: EventEmitter<StarSystem> = new EventEmitter<StarSystem>();

    private deselectEverythingEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    private stellarMoveEmitter: EventEmitter<FleetMove[]> = new EventEmitter<FleetMove[]>();

    private interstellarMoveEmitter: EventEmitter<FleetMove[]> = new EventEmitter<FleetMove[]>();

    private cancelMovementEmitter: EventEmitter<Fleet[]> = new EventEmitter<Fleet[]>();

    private storage: Map<number, Fleet> = new Map<number, Fleet>();

    selectedStarSystem?: StarSystem;

    selectedFleets: Fleet[] = [];

    fleetOrbit?: FleetOrbit;
    selectedPlanet?: Planet;
    displayedStarSystem?: StarSystem;

    private selectedFleetMarker: FleetMarker[] = [];
    private plannedStellarMoves: FleetMove[] = [];
    private plannedInterstellarMoves: FleetMove[] = [];
    private fleetsToCancelMovement: Fleet[] = [];

    constructor(private fleetService: FleetApiService) {
        super();
    }

    clear(tabIndex?: number) {
        // fixme deselect stuff on action or redraw
        this.selectedStarSystem = undefined;
        this.selectedFleets = [];
        this.fleetOrbit = undefined;
        this.selectedPlanet = undefined;
        if (tabIndex != 1) {
            // if changed to system map do not delete the displayed system
            this.displayedStarSystem = undefined;
        }
        this.selectedFleetMarker = [];
        this.plannedInterstellarMoves = [];
        this.fleetsToCancelMovement = [];
        this.storage.clear();
    }

    deselect() {
        this.selectedStarSystem = undefined;
        this.selectedFleetMarker = [];
        this.selectedFleets = [];
        this.deselectEverythingEmitter.emit(true);
    }

    removeSelectedStarSystem() {
        this.selectedStarSystem = undefined;
    }

    removeSelectedPlanet() {
        this.fleetOrbit = undefined;
        this.selectedPlanet = undefined;
    }

    getDisplaySystemEmitter() {
        return this.displayStarSystemEmitter;
    }

    getDeselectEverythingEmitter() {
        return this.deselectEverythingEmitter;
    }

    getStellarMoveEmitter() {
        return this.stellarMoveEmitter;
    }

    getInterstellarMoveEmitter() {
        return this.interstellarMoveEmitter;
    }

    getCancelMovementEmitter() {
        return this.cancelMovementEmitter;
    }

    displaySystem(system?: StarSystem) {
        this.displayedStarSystem = system;
        this.displayStarSystemEmitter.emit(system);
    }

    isSelectedStarSystem(idStarSystem?: number) {
        if (!idStarSystem) {
            return !!this.selectedStarSystem;
        }
        return idStarSystem === this.selectedStarSystem?.idStarSystem;
    }

    isStarSystemDisplayed(idStarSystem?: number) {
        if (!idStarSystem) {
            return !!this.displayedStarSystem;
        }
        return idStarSystem === this.displayedStarSystem?.idStarSystem;
    }

    isSelectedPlanet(idPlanet?: number) {
        if (!idPlanet) {
            return !!this.selectedPlanet;
        }
        return idPlanet === this.selectedPlanet?.idPlanet;
    }

    isSelectedFleetMarker() {
        return this.selectedFleetMarker.length > 0;
    }

    setSelectedStarSystem(system: StarSystem) {
        this.selectedStarSystem = system;
    }

    setSelectedPlanet(planet: Planet) {
        this.selectedPlanet = planet;
        this.fleetOrbit = {
            orbit: planet.orbit,
            system: this.displayedStarSystem
        }
    }

    addFleetMarker(fleetMarker: FleetMarker) {
        const length = this.selectedFleetMarker.filter(fm => fm.fleet.id == fleetMarker.fleet.id).length;
        if (length == 0) {
            this.selectedFleetMarker.push(fleetMarker);
            this.fetchFleet(fleetMarker);
        }
    }

    private fetchFleet(fleetMarker: FleetMarker) {
        const fleet = this.storage.get(fleetMarker.fleet.id);
        if (!!fleet) {
            this.pushSelectedFleets(fleet);
            return;
        }

        const sub = this.fleetService.getFleet(fleetMarker.fleet.id).subscribe(resp => {
            this.pushSelectedFleets(resp);
            this.storage.set(resp.idFleet, resp);
        });
        this.subscriptions.push(sub);
    }

    private pushSelectedFleets(fleet: Fleet) {
        const newArr: Fleet[] = [];
        this.selectedFleets.forEach(f => newArr.push(f));
        newArr.push(fleet);
        this.selectedFleets = newArr;
    }

    removeSelectedFleetMarker(fleetMarker: FleetMarker) {
        this.selectedFleetMarker = this.selectedFleetMarker.filter(fm => fm.fleet.id != fleetMarker.fleet.id);
        this.selectedFleets = this.selectedFleets.filter(f => f.idFleet != fleetMarker.fleet.id);
        console.log(this.selectedFleets)
    }

    moveDisabled() {
        const fleetsPresent = this.selectedFleets.filter(f => !f.move).length > 0;
        return !(fleetsPresent && (this.isSelectedStarSystem() || this.isSelectedPlanet()));
    }

    mergeDisabled() {
        let nope = this.selectedFleets.length < 2 || this.isStarSystemDisplayed();
        if (!nope) {
            const orbits: Orbit[] = [];
            this.selectedFleets.filter(f => !!f.orbit && !!f.orbit.orbit).forEach(f => orbits.push(f.orbit!.orbit!));
            let doubledOrbitPresent: boolean = false;
            for (let i = 0; i < orbits.length; i++) {
                const first = orbits[i];
                for (let j = 0; j < orbits.length; j++) {
                    if (i != j) {
                        const second = orbits[j];
                        const x1 = NavigationCalculator.convertDistanceToMetric(first.xCoordinate, DistanceMetricEnum.LS);
                        const x2 = NavigationCalculator.convertDistanceToMetric(second.xCoordinate, DistanceMetricEnum.LS);
                        const y1 = NavigationCalculator.convertDistanceToMetric(first.yCoordinate, DistanceMetricEnum.LS);
                        const y2 = NavigationCalculator.convertDistanceToMetric(second.yCoordinate, DistanceMetricEnum.LS);
                        if (x1 == x2 && y1 == y2) {
                            doubledOrbitPresent = true;
                            break;
                        }
                    }
                }
                if (doubledOrbitPresent) {
                    break;
                }
            }
            nope = !doubledOrbitPresent;
        }
        return nope;
    }

    cancelDisabled() {
        return this.selectedFleets.filter(f => !!f.move).length < 1;
    }

    stellarMove() {
        this.stellarMoveEmitter.emit(this.plannedStellarMoves);
    }

    interstellarMove() {
        this.interstellarMoveEmitter.emit(this.plannedInterstellarMoves);
    }

    cancel() {
        this.cancelMovementEmitter.emit(this.fleetsToCancelMovement);
    }

    merge() {
        console.log("merge")
    }

    setPlannedInterstellarMovements(plannedMoves: FleetMove[]) {
        this.plannedInterstellarMoves = plannedMoves;
    }

    setPlannedStellarMovements(plannedMoves: FleetMove[]) {
        this.plannedStellarMoves = plannedMoves;
    }

    setFleetToCancelMovement(fleetsToStopMoving: Fleet[]) {
        this.fleetsToCancelMovement = fleetsToStopMoving;
    }
}