import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ConfirmedMove, Fleet, FleetApiService, FleetMove, Move, Orbit, Planet, StarSystem} from "../../../services/swagger";
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

    fleetsDesignatedForCancel: Fleet[] = [];

    destinationRepresentation: string = "";

    plannedMovements: ConfirmedMove[] = [];

    constructor(private fleetService: FleetApiService,
                protected commService: StarMapCommunicationService) {
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
            this.commService.setConfirmedMovements(this.plannedMovements);
            this.plannedMovements
                .flatMap(m => this.fleets.filter(f => !!m.attendants.find(fm => fm.fleet.id == f.idFleet)))
                .forEach(f => this.selectForFlight(true, f));
        });
        this.subscriptions.push(sub);
    }

    selectForFlight(checked: boolean, fleet: Fleet) {
        let indexOf = this.commService.getFleetsDesignatedForMotion().indexOf(fleet);
        if (checked && indexOf == -1) {
            this.commService.getFleetsDesignatedForMotion().push(fleet);
        } else {
            this.commService.spliceFleetsDesignatedForMotion(indexOf, 1);
        }
        this.sendPlannedFlights();
    }

    sendPlannedFlights() {
        const m: Map<number, Move> = new Map<number, Move>();
        this.plannedMovements.forEach(move => {
            move.attendants.forEach(fm =>
                m.set(fm.fleet.id, move.move)
            );
        })
        let plannedMoves: FleetMove[] = this.commService.getFleetsDesignatedForMotion().map(fleet => {
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
        let moves = this.plannedMovements.find(fl => !!fl.attendants.find(fm => fm.fleet.id == fleet.idFleet));
        return moves ? moves.move.ticksLeft : '';
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
