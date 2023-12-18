import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Distance, Fleet, FleetApiService, FleetMove, Move, Orbit, StarSystem} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {NavigationCalculator} from "../../../services/helper/navigation-calculator.helper";
import {SystemViewHelper} from "../../star-map/payload/system-view-helper";
import {StarMapCommunicationService} from "../../../services/intercom/star-map-communication.service";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

@Component({
    selector: 'app-interstellar-fleet-movement-edit',
    templateUrl: './interstellar-fleet-movement-edit.component.html',
    styleUrls: ['./interstellar-fleet-movement-edit.component.scss']
})
export class InterstellarFleetMovementEditComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    deselectAllMovements: number = 0;

    @Input()
    fleets: Fleet[] = [];
    fleetsInputDefinition: string = "fleets";

    fleetsDesignatedForMotion: Fleet[] = [];

    /**
     * the destination system
     */
    @Input()
    destination?: StarSystem;
    destinationDefinition: string = "destination";

    plannedMovements: Move[] = [];
    nonFtlFleets: number[] = [];

    constructor(private fleetService: FleetApiService,
                private commService: StarMapCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetsInputDefinition]) {
            this.fleets = this.fleets.filter(f => f.owner.idUser === this.userId).filter(f => !f.move);
        }
        if (changes['deselectAllMovements']) {
            this.fleets.forEach(f => this.selectForFlight(false, f));
        }
        this.fetchPossibleMovements();
    }

    /**
     * calculates the hyper limit
     * @private
     */
    private calculateHyperLimit() {
        if (!this.destination) {
            return 0;
        }

        const lightMinutesToHyperLimit = this.destination.starClassType.lightMinutesToHyperLimit;
        const hyperRadius: Distance = {
            coordinate: lightMinutesToHyperLimit,
            distanceMetric: DistanceMetricEnum.LM
        }
        return this.convertToStarSystemStandardMetric(hyperRadius);
    }

    private convertToStarSystemStandardMetric(distance: Distance) {
        return NavigationCalculator.convertDistanceToMetric(distance, SystemViewHelper.STANDARD_METRIC);
    }

    /**
     * creates a random point at the hyper limit
     * @private
     */
    private createRandomPointOnHyperLimit(): Orbit {
        // todo place it better
        let hyperLimit = this.calculateHyperLimit();
        let random = Math.random();
        let pointAngleInRadians = 360 * random;
        let x = Math.cos(pointAngleInRadians) * hyperLimit;
        let y = Math.sin(pointAngleInRadians) * hyperLimit;
        return {
            xCoordinate: {
                coordinate: x,
                distanceMetric: SystemViewHelper.STANDARD_METRIC
            },
            yCoordinate: {
                coordinate: y,
                distanceMetric: SystemViewHelper.STANDARD_METRIC
            }
        };
    }

    /**
     * only call the api if a movement is possible
     * @private
     */
    private fetchPossibleMovements() {
        if (!this.destination) {
            return;
        }

        let hyperLimitPosition = this.createRandomPointOnHyperLimit();
        let fleetMoves = this.fleets
            .filter(f => !f.move)
            .filter(f => f.state.isFTLCapable)
            .map(fleet => {
                const fm: FleetMove = {
                    idFleetToMove: fleet.idFleet,
                    idDestinationSystem: this.destination!.idStarSystem,
                    destinationOrbit: hyperLimitPosition
                }
                return fm;
            });
        this.nonFtlFleets = this.fleets.filter(f => !f.move).filter(f => !f.state.isFTLCapable).map(f => f.idFleet);

        if (fleetMoves.length < 1) {
            return;
        }
        let sub = this.fleetService.planMovements(fleetMoves).subscribe(resp => {
            this.plannedMovements = resp;
            this.commService.setConfirmedInterstellarMovements(this.plannedMovements);
            const fleetsForMove = this.plannedMovements.flatMap(m => this.fleets.filter(f => f.idFleet === m.idFleetInMotion));
            fleetsForMove.forEach(f => this.selectForFlight(true, f));
        });
        this.subscriptions.push(sub);
    }

    sendPlannedFlights() {
        const m: Map<number, Move> = new Map<number, Move>();
        this.plannedMovements.forEach(move => {
            m.set(move.idFleetInMotion, move);
        })
        let plannedMoves: FleetMove[] = this.fleetsDesignatedForMotion.map(fleet => {
            let plannedMove: Move | undefined = m.get(fleet.idFleet);
            if (!plannedMove) {
                throw new Error("There should be a movement already planned and validated.");
            }
            let move: FleetMove = {
                idFleetToMove: fleet.idFleet,
                idDestinationPlanet: plannedMove.targetOrbit.planet?.idPlanet,
                idDestinationSystem: plannedMove.targetOrbit.system?.idStarSystem,
                destinationOrbit: plannedMove.targetOrbit.orbit
            }
            return move;
        });
        this.commService.setPlannedInterstellarMovements(plannedMoves);
    }

    selectForFlight(checked: boolean, fleet: Fleet) {
        let indexOf = this.fleetsDesignatedForMotion.indexOf(fleet);
        if (checked && indexOf == -1) {
            this.fleetsDesignatedForMotion.push(fleet);
        } else {
            this.fleetsDesignatedForMotion.splice(indexOf, 1);
        }
        this.sendPlannedFlights();
    }

    getTicks(fleet: Fleet) {
        let moves = this.plannedMovements.filter(fl => fl.idFleetInMotion == fleet.idFleet);
        if (moves.length != 1) {
            return "";
        }
        return moves[0].ticksLeft;
    }

    isSameOrbit(fleet: Fleet) {
        const currentOrbit: Orbit | undefined = fleet.orbit?.system?.orbit;
        const destinationOrbit: Orbit | undefined = this.destination?.orbit;
        if (!currentOrbit || !destinationOrbit) {
            return false;
        }
        return NavigationCalculator.isSameOrbit(currentOrbit, destinationOrbit);
    }
}
