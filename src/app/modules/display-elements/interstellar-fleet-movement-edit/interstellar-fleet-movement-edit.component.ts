import {AfterViewInit, Component, Inject, Input, Optional, SimpleChanges} from '@angular/core';
import {Distance, Fleet, FleetApiService, FleetMove, Move, Orbit, StarSystem} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {NavigationCalculator} from "../../../NavigationCalculator";
import {SystemViewHelper} from "../../star-map/payload/system-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

@Component({
    selector: 'app-interstellar-fleet-movement-edit',
    templateUrl: './interstellar-fleet-movement-edit.component.html',
    styleUrls: ['./interstellar-fleet-movement-edit.component.scss']
})
export class InterstellarFleetMovementEditComponent extends SubscriptionManager implements AfterViewInit {

    /**
     * the fleets to display
     */
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

    @Input()
    private readonly callback?: Function | null;

    plannedMovements: Move[] = [];

    constructor(@Optional() @Inject('fleets') fleets: Fleet[] | undefined,
                @Optional() @Inject('destination') destination: StarSystem | undefined,
                @Optional() @Inject('callback') cb: Function | null,
                private tokenStorage: TokenStorage,
                private fleetApi: FleetApiService) {
        super();
        this.fleets = !!fleets ? fleets : [];
        this.destination = destination;
        this.callback = cb;

    }

    ngAfterViewInit(): void {
        this.fetchPossibleMovements();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetsInputDefinition]) {
            this.fetchPossibleMovements();
        }
        if (changes[this.destinationDefinition]) {
            this.fetchPossibleMovements();
        }
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
        let fleetMoves = this.fleets.map(fleet => {
            const fm: FleetMove = {
                idFleetToMove: fleet.idFleet,
                idDestinationSystem: this.destination!.idStarSystem,
                destinationOrbit: hyperLimitPosition
            }
            return fm;
        });
        if (fleetMoves.length < 1) {
            return;
        }
        let userID = this.tokenStorage.getUserID();
        let sub = this.fleetApi.planMovements(fleetMoves, userID).subscribe(resp => {
            this.plannedMovements = resp;
        });
        this.subscriptions.push(sub);
    }

    sendPlannedFlights() {
        if (!!this.callback && this.fleetsDesignatedForMotion.length > 0) {
            this.callback(this.fleetsDesignatedForMotion, this.plannedMovements);
        }
    }

    selectForFlight(checked: boolean, fleet: Fleet) {
        if (checked) {
            this.fleetsDesignatedForMotion.push(fleet);
        } else {
            let indexOf = this.fleetsDesignatedForMotion.indexOf(fleet);
            this.fleetsDesignatedForMotion.slice(indexOf);
        }
        this.sendPlannedFlights();
    }

    getTicksLeftForFleet(fleet: Fleet) {
        let moves = this.plannedMovements.filter(fl => fl.idFleetInMotion == fleet.idFleet);
        if (moves.length != 1) {
            return "";
        }
        return moves[0].moveDoneAtZero;
    }
}
