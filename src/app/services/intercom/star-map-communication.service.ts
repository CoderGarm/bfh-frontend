import {SubscriptionManager} from "../../subscription.manager";
import {EventEmitter, Injectable} from "@angular/core";
import {
    ConfirmedMove,
    Distance,
    EnumValueDto,
    Fleet,
    FleetApiService,
    FleetMarker,
    FleetMerge,
    FleetMove,
    FleetOrbit,
    Orbit,
    Planet,
    ResourceDeposit,
    ResourcesApiService,
    StarSystem
} from "../swagger";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {RadialMenuItem} from "../../modules/shared-module/components/radial-menu-component/radial-menu.component";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export interface StellarMovement {
    plannedMoves: FleetMove[],
    toCancel: Fleet[]
}

@Injectable()
export class StarMapCommunicationService extends SubscriptionManager {

    private displayStarSystemEmitter: EventEmitter<StarSystem> = new EventEmitter<StarSystem>();

    private deselectEverythingEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    private interstellarMoveEmitter: EventEmitter<FleetMove[]> = new EventEmitter<FleetMove[]>();

    private confirmedMovesEmitter: EventEmitter<ConfirmedMove[]> = new EventEmitter<ConfirmedMove[]>();

    private stellarMoveEmitter: EventEmitter<StellarMovement> = new EventEmitter<StellarMovement>();

    private mergeFleetsEmitter: EventEmitter<FleetMerge> = new EventEmitter<FleetMerge>();

    private fleetsDesignatedForMotionEmitter: EventEmitter<Fleet[]> = new EventEmitter<Fleet[]>();

    private storage: Map<number, Fleet> = new Map<number, Fleet>();
    private storageUsedPersonal: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    private fleetsDesignatedForMotion: Fleet[] = [];
    galaxyFleetDistribution: FleetMarker[] = [];
    selectedStarSystem?: StarSystem;
    selectedFleets: Fleet[] = [];
    fleetOrbit?: FleetOrbit;
    selectedPlanet?: Planet;
    displayedStarSystem?: StarSystem;

    private selectedFleetMarker: FleetMarker[] = [];
    private plannedStellarMoves: FleetMove[] = [];
    private plannedInterstellarMoves: FleetMove[] = [];
    private confirmedMovements: ConfirmedMove[] = [];
    private fleetsToCancelMovement: Fleet[] = [];
    private fleetMerge?: FleetMerge;

    menuItemsModel: RadialMenuItem[] = [];

    constructor(private fleetService: FleetApiService,
                private resourceService: ResourcesApiService) {
        super();

        this.menuItemsModel.push({labelKey: "star-map.notch.action.show-info"});
        this.menuItemsModel.push({labelKey: "star-map.notch.action.show-move"});
        this.menuItemsModel.push({labelKey: "star-map.notch.action.show-merge"});
        this.menuItemsModel.push({labelKey: "star-map.notch.action.show-transport"});
    }


    menuClicked(event: RadialMenuItem) {
        console.log('menuClicked', event.label);
    }

    clear() {
        this.selectedStarSystem = undefined;
        this.selectedFleets = [];
        this.fleetOrbit = undefined;
        this.selectedPlanet = undefined;
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

    getConfirmedMovesEmitter() {
        return this.confirmedMovesEmitter;
    }

    getMergeFleetsEmitter() {
        return this.mergeFleetsEmitter;
    }

    getSelectedFleetMarker() {
        return this.selectedFleetMarker;
    }

    getMovingFleetMarker() {
        return this.selectedFleetMarker.filter(fm => !!fm.move);
    }

    getFleetsDesignatedForMotionEmitter() {
        return this.fleetsDesignatedForMotionEmitter;
    }


    getFleetsDesignatedForMotion() {
        return this.fleetsDesignatedForMotion;
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

    isSelectedFleetMarker(idFleet?: number) {
        if (!idFleet) {
            return this.selectedFleetMarker.length > 0;
        }
        return this.selectedFleetMarker.filter(fm => fm.fleet.id === idFleet).length > 0;
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
        const idFleet = fleetMarker.fleet.id;
        const fleet = this.storage.get(idFleet);
        if (!!fleet) {
            this.pushSelectedFleets(fleet);
        } else {
            const sub = this.fleetService.getFleet(idFleet).subscribe(resp => {
                this.pushSelectedFleets(resp);
                this.storage.set(resp.idFleet, resp);
            });
            this.subscriptions.push(sub);
        }

        const deposit = this.storageUsedPersonal.get(idFleet);
        if (!deposit) {
            const sub = this.resourceService.getCostsForFleet(idFleet).subscribe(resp => {
                resp.subType.typeName = EnumValueDto.EDepositTypeEnum.UTILIZATION
                this.storageUsedPersonal.set(idFleet, resp);
            });
            this.subscriptions.push(sub);
        }
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
    }

    executeMoveDisabled() {
        const fleetsInterstellarSelected = this.plannedInterstellarMoves.length > 0;
        const fleetsStellarSelected = this.plannedStellarMoves.length > 0;
        const a = this.isSelectedStarSystem();
        const b = this.isSelectedPlanet();
        const result = (fleetsInterstellarSelected || fleetsStellarSelected) && (a || b);
        return !result;
    }

    executeCancelDisabled() {
        const fleetsSelected = this.fleetsToCancelMovement.length > 0;
        return !fleetsSelected;
    }

    showMoveDisabled() {
        const fleetsWithoutMovement = this.selectedFleets.filter(f => f.owner.idUser == this.userId).filter(f => !f.move).filter(f => f.state.isOperational);
        const fleetsWithoutMovementPresent = fleetsWithoutMovement.length > 0;
        const movableFleetsPresent = fleetsWithoutMovementPresent && (this.isSelectedStarSystem() || this.isSelectedPlanet());
        const fleetsWithDifferentOrbits: Fleet[] = [];
        if (movableFleetsPresent) {
            if (this.isSelectedPlanet()) {
                const planet = this.selectedPlanet!;
                const orbit: Orbit = planet.orbit;
                fleetsWithoutMovement.filter(fleet => {
                    const isSamePlanetaryOrbit = NavigationCalculator.isSameOrbit(fleet.orbit!.orbit!, orbit);
                    if (!isSamePlanetaryOrbit) {
                        fleetsWithDifferentOrbits.push(fleet);
                    }
                });
            }
            if (this.isSelectedStarSystem()) {
                const system = this.selectedStarSystem!;
                fleetsWithoutMovement.filter(fleet => {
                    if (fleet.orbit?.system?.idStarSystem != system.idStarSystem) {
                        fleetsWithDifferentOrbits.push(fleet);
                    }
                });
            }
        }
        return !movableFleetsPresent || !(fleetsWithDifferentOrbits.length != 0);
    }

    showCancelMoveDisabled() {
        const fleetsWithCancelableMovementPresent = this.selectedFleets
            .filter(f => f.owner.idUser == this.userId)
            .filter(f => !!f.move)
            .filter(f => !!f.move!.startOrbit.system)
            .filter(f => !!f.move!.targetOrbit.system)
            .filter(f => f.move!.startOrbit.system!.idStarSystem == f.move!.targetOrbit.system!.idStarSystem).length > 0;
        return !fleetsWithCancelableMovementPresent;
    }

    showMergeDisabled() {
        const ownFleets = this.selectedFleets.filter(f => f.owner.idUser == this.userId);
        let nope = ownFleets.length < 2 || !this.isStarSystemDisplayed();
        if (!nope) {
            const orbits: Orbit[] = [];
            ownFleets.filter(f => !!f.orbit && !!f.orbit.orbit).forEach(f => orbits.push(f.orbit!.orbit!));
            let mergeCandidates: number = 0;
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
                            mergeCandidates++;
                        }
                    }
                }
            }
            nope = mergeCandidates < 2;
        }
        return nope;
    }

    showTransportDisabled() {
        return !(this.selectedFleets.filter(f => f.owner.idUser == this.userId).filter(f => f.state.isOperational).length > 0 && this.isStarSystemDisplayed());
    }

    deselectDisabled() {
        return this.selectedFleets.length == 0 && !this.selectedPlanet && !this.selectedStarSystem;
    }

    infoDisabled() {
        return this.selectedFleets.length == 0;
    }

    stellarMove() {
        this.stellarMoveEmitter.emit({
            plannedMoves: this.plannedStellarMoves,
            toCancel: this.fleetsToCancelMovement
        });
        this.deselect();
    }

    interstellarMove() {
        this.interstellarMoveEmitter.emit(this.plannedInterstellarMoves);
        this.deselect();
    }

    executeMerge() {
        this.mergeFleetsEmitter.emit(this.fleetMerge);
        this.deselect();
    }

    resetMerge() {
        this.fleetMerge = undefined;
    }

    setPlannedInterstellarMovements(plannedMoves: FleetMove[]) {
        this.plannedInterstellarMoves = plannedMoves;
    }

    setConfirmedMovements(confirmedMoves: ConfirmedMove[]) {
        this.confirmedMovements = confirmedMoves;
        this.confirmedMovesEmitter.emit(this.confirmedMovements);
    }

    setPlannedStellarMovements(plannedMoves: FleetMove[]) {
        this.plannedStellarMoves = plannedMoves;
    }

    setFleetToCancelMovement(fleetsToStopMoving: Fleet[]) {
        this.fleetsToCancelMovement = fleetsToStopMoving;
    }

    getUtilizedPersonal(fleet: Fleet) {
        return this.storageUsedPersonal.get(fleet.idFleet);
    }

    setFleetConstellationForMerge(fm: FleetMerge) {
        this.fleetMerge = fm;
    }

    mergeDisabled() {
        return !this.fleetMerge;
    }

    pushFleetsDesignatedForMotion(fleet: Fleet) {
        this.fleetsDesignatedForMotion.push(fleet);
        this.fleetsDesignatedForMotionEmitter.emit(this.fleetsDesignatedForMotion);
    }

    spliceFleetsDesignatedForMotion(indexOf: number, number: number) {
        this.fleetsDesignatedForMotion.splice(indexOf, number);
        this.fleetsDesignatedForMotionEmitter.emit(this.fleetsDesignatedForMotion);
    }

    getConfirmedInterstellarMoves(fleetIDs: number[]) {
        return this.confirmedMovements.filter(cm => !!cm.attendants.find(a => fleetIDs.includes(a.fleet.id)));
    }
}
