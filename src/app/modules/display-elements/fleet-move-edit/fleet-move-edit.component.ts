import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetMove, Move, Orbit, Planet, PlanetApiService, StarSystem} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {StarMapCommunicationService} from "../../../services/intercom/star-map-communication.service";
import {NavigationCalculator} from "../../../services/helper/navigation-calculator.helper";

@Component({
    selector: 'app-fleet-move-edit',
    templateUrl: './fleet-move-edit.component.html',
    styleUrls: ['./fleet-move-edit.component.scss']
})
export class FleetMoveEditComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    deselectAllMovements: number = 0;

    @Input()
    fleets: Fleet[] = [];

    fleetsForMove: Fleet[] = [];
    fleetsForCancel: Fleet[] = [];

    @Input()
    destination?: Planet;

    @Input()
    system?: StarSystem;

    fleetsDesignatedForMotion: Fleet[] = [];
    fleetsDesignatedForCancel: Fleet[] = [];

    destinationRepresentation: string = "";

    plannedMovements: Move[] = [];

    constructor(private fleetService: FleetApiService,
                private planetService: PlanetApiService,
                private commService: StarMapCommunicationService) {
        super();
    }

    ngAfterViewInit(): void {
    }


    ngOnChanges(changes: SimpleChanges): void {
        this.fetchPossibleMovement();
        this.createDestinationRepresentation();
        this.fleetsForMove = this.fleets.filter(f => f.owner.idUser === this.userId).filter(f => !f.move);
        this.fleetsForCancel = this.fleets.filter(f => f.owner.idUser === this.userId).filter(f => !!f.move);
        if (changes['deselectAllMovements']) {
            this.fleetsForMove.forEach(f => this.selectForFlight(false, f));
            this.fleetsForCancel.forEach(f => this.selectForCancel(false, f));
        }
    }

    /**
     * only call the api if a movement is possible
     * @private
     */
    private fetchPossibleMovement() {
        if (!this.destination || !this.destination) {
            return;
        }

        let fleetMoves = this.fleets.filter(f => !f.move).map(fleet => {
            const fm: FleetMove = {
                idFleetToMove: fleet.idFleet,
                idDestinationPlanet: this.destination?.idPlanet,
                idDestinationSystem: this.destination?.starSystem.id,
                destinationOrbit: this.destination?.orbit
            }
            return fm;
        });
        if (fleetMoves.length < 1) {
            return;
        }
        let sub = this.fleetService.planMovements(fleetMoves).subscribe(resp => {
            this.plannedMovements = resp;
            const fleetsForMove = this.plannedMovements.flatMap(m => this.fleets.filter(f => f.idFleet === m.idFleetInMotion));
            fleetsForMove.forEach(f => this.selectForFlight(true, f));
        });
        this.subscriptions.push(sub);
    }

    selectForFlight(checked: boolean, fleet: Fleet) {
        if (checked) {
            this.fleetsDesignatedForMotion.push(fleet);
        } else {
            let indexOf = this.fleetsDesignatedForMotion.indexOf(fleet);
            this.fleetsDesignatedForMotion.splice(indexOf, 1);
        }
        this.sendPlannedFlights();
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
        this.commService.setPlannedStellarMovements(plannedMoves);
    }

    selectForCancel(checked: boolean, fleet: Fleet) {
        let indexOf = this.fleetsDesignatedForCancel.indexOf(fleet);
        if (checked && indexOf == -1) {
            this.fleetsDesignatedForCancel.push(fleet);
        } else {
            this.fleetsDesignatedForCancel.splice(indexOf, 1);
        }
        this.sendCancelFlights();
    }

    sendCancelFlights() {
        this.commService.setFleetToCancelMovement(this.fleetsDesignatedForCancel);
    }

    getTicks(fleet: Fleet) {
        let moves = this.plannedMovements.filter(fl => fl.idFleetInMotion == fleet.idFleet);
        if (moves.length != 1) {
            return "";
        }
        return moves[0].ticksLeft;
    }

    getTicksLeft(fleet: Fleet) {
        return fleet.move!.originalDuration - fleet!.move!.ticksLeft;
    }

    private createDestinationRepresentation() {
        let destination = "";
        if (!!this.fleets) {
            if (!!this.destination) {
                destination += this.destination.name;
            }
            if (!!this.system) {
                destination += " in " + this.system.name;
            }
        }
        this.destinationRepresentation = destination;
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
