import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetMove, Move, Planet} from "../../../services/swagger";
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
    @Input()
    fleetInput?: Fleet;
    fleetInputDefinition: string = "fleetInput";

    /**
     * the fleet which will take all the other war ships
     */
    @Input()
    targetPlanet?: Planet;
    targetPlanetDefinition: string = "targetPlanet";

    @Input()
    private readonly callback: Function | null;

    /**
     * the planned and possible movement
     */
    plannedMovement?: Move;

    constructor(@Optional() @Inject('fleetInput') fleetSubject: Fleet | undefined,
                @Optional() @Inject('targetPlanet') targetPlanet: Planet | undefined,
                @Optional() @Inject('callback') cb: Function | null,
                private tokenStorage: TokenStorage,
                private fleetApi: FleetApiService) {
        super();
        this.callback = cb;
        this.fleetInput = fleetSubject;
        this.targetPlanet = targetPlanet;
    }

    ngAfterViewInit(): void {
        this.fetchPossibleMovement();
    }

    /**
     * only call the api if a movement is possible
     * @private
     */
    private fetchPossibleMovement() {
        let userID = this.tokenStorage.getUserID();
        if (!!userID && !!this.fleetInput && !this.fleetInput.move && !!this.targetPlanet) {
            const fm: FleetMove = {
                idFleetToMove: this.fleetInput.idFleet,
                idTargetPlanet: this.targetPlanet.idPlanet
            }
            let sub = this.fleetApi.planMovement(userID, fm).subscribe(resp => {
                this.plannedMovement = resp;
            });
            this.subscriptions.push(sub);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetInputDefinition]) {
            this.fetchPossibleMovement();
        }
        if (changes[this.targetPlanetDefinition]) {
            this.fetchPossibleMovement();
        }
    }


    getTicksLeft() {
        return this.fleetInput!.move!.originalDuration - this.fleetInput!.move!.moveDoneAtZero;
    }

    cancelFlight() {
        if (!!this.callback && !!this.fleetInput) {
            this.callback(this.fleetInput)
        }
    }
}
