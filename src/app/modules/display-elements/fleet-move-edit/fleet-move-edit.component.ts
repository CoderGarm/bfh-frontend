import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetMarker, FleetMove, FleetOrbit, Move, Planet, PlanetApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {TokenStorage} from "../../../services/authentication/token-storage.service";

@Component({
    selector: 'app-fleet-move-edit',
    templateUrl: './fleet-move-edit.component.html',
    styleUrls: ['./fleet-move-edit.component.scss']
})
export class FleetMoveEditComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * the fleet which will take all the other war ships
     */
    @Input() // please note that the missing type-safetyness of javascript allows it to use a FleetMarker here
    fleetInput?: Fleet;
    fleetInputDefinition: string = "fleetInput";

    /**
     * the fleet which will take all the other war ships
     */
    @Input()
    targetOrbit?: FleetOrbit;
    targetOrbitDefinition: string = "targetOrbit";

    @Input()
    private readonly callback: Function | null;

    destination?: Planet;

    destinationRepresentation: string = "";

    /**
     * the planned and possible movement
     */
    plannedMovement?: Move;

    constructor(@Optional() @Inject('fleetInput') fleetInput: Fleet | FleetMarker | undefined,
                @Optional() @Inject('targetOrbit') targetOrbit: FleetOrbit | undefined,
                @Optional() @Inject('callback') cb: Function | null,
                private tokenStorage: TokenStorage,
                private fleetService: FleetApiService,
                private planetService: PlanetApiService) {
        super();
        this.callback = cb;
        this.fetchFleet(fleetInput);
        this.targetOrbit = targetOrbit;
        this.fetchDestination();
    }

    private fetchFleet(fleetSubject: Fleet | FleetMarker | undefined) {
        if (!fleetSubject) {
            return;
        }
        if ('idFleet' in fleetSubject) {
            this.fleetInput = fleetSubject;
            this.fetchPossibleMovement();
            this.fetchDestination();
            return;
        }
        if ('fleet' in fleetSubject) {
            const sub = this.fleetService.getFleet(fleetSubject.fleet.id).subscribe(resp => {
                this.fleetInput = resp;
                this.fetchPossibleMovement();
                this.fetchDestination();
            });
            this.subscriptions.push(sub);
        }
    }

    ngAfterViewInit(): void {
    }

    private fetchDestination() {
        if (!!this.targetOrbit && !!this.targetOrbit.system && !!this.targetOrbit.orbit) {
            let idStarSystem = this.targetOrbit.system.idStarSystem;
            let orbit = this.targetOrbit.orbit;
            let sub = this.planetService.getPlanetByCoordinates(orbit, idStarSystem)
                .subscribe(resp => {
                    this.destination = resp;
                    this.createDestinationRepresentation();
                });
            this.subscriptions.push(sub);
        }
        if (this.destinationRepresentation.length == 0) {
            this.createDestinationRepresentation();
        }
    }

    /**
     * only call the api if a movement is possible
     * @private
     */
    private fetchPossibleMovement() {
        if (!!this.fleetInput && !this.fleetInput.move && !!this.targetOrbit) {
            const fm: FleetMove = {
                idFleetToMove: this.fleetInput.idFleet,
                destinationOrbit: this.targetOrbit.orbit
            }
            let sub = this.fleetService.planMovement(fm).subscribe(resp => {
                this.plannedMovement = resp;
            });
            this.subscriptions.push(sub);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fleetInput']) {
            this.fetchFleet(changes['fleetInput'].currentValue);
        }
        this.fetchPossibleMovement();
        this.fetchDestination();
    }


    getTicksLeft() {
        return this.fleetInput!.move!.originalDuration - this.fleetInput!.move!.moveDoneAtZero;
    }

    cancelFlight() {
        if (!!this.callback && !!this.fleetInput) {
            this.callback(this.fleetInput)
        }
    }

    private createDestinationRepresentation() {
        let destination = "";
        if (!!this.fleetInput) {
            if (!!this.destination) {
                destination += this.destination.name;
            } else if (!!this.targetOrbit && !!this.targetOrbit.orbit) {
                let orbit = this.targetOrbit.orbit;
                destination += orbit.xCoordinate.coordinate + ", " + orbit.yCoordinate.coordinate;
            }
            if (!!this.targetOrbit && !!this.targetOrbit.system) {
                destination += " in " + this.targetOrbit.system.name;
            }
        }
        this.destinationRepresentation = destination;
    }
}
