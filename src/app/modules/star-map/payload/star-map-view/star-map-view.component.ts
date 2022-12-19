import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetMerge, FleetMove, Planet, StarMapApiService, StarSystem} from "../../../../services/swagger";
import {MatDialog} from "@angular/material/dialog";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {SystemViewHelper} from "../system-view-helper";
import {StellarMovement} from "../../../../star-map-communication.service";
import {timer} from "rxjs";

@Component({
    selector: 'app-star-map-view',
    templateUrl: './star-map-view.component.html',
    styleUrls: ['./star-map-view.component.scss']
})
export class StarMapViewComponent extends SystemViewHelper implements AfterViewInit, OnChanges {

    @Input()
    starSystemSelectionInput?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelectionInput";

    planets: Planet[] = [];
    private system?: StarSystem;


    constructor(private starMapApi: StarMapApiService,
                private fleetService: FleetApiService,
                tokenStorage: TokenStorage,
                private dialog: MatDialog) {
        super(tokenStorage);

        let sub = this.starMapCommService.getStellarMoveEmitter().subscribe(resp => this.executeStellarMovement(resp));
        this.subscriptions.push(sub);
        sub = this.starMapCommService.getMergeFleetsEmitter().subscribe(resp => this.executeMergeFleets(resp))
        this.subscriptions.push(sub);
    }

    private executeMergeFleets(fm: FleetMerge) {
        let sub = this.fleetService.mergeFleets(fm).subscribe(resp => {
            if (resp) {
                this.createStarMap();
            }
        });
        this.subscriptions.push(sub);
    }

    private executeStellarMovement(m: StellarMovement) {
        const plannedMoves: FleetMove[] = m.plannedMoves;
        const toCancel: Fleet[] = m.toCancel;

        let moveDone = plannedMoves.length == 0;
        let cancelDone = toCancel.length == 0;
        if (plannedMoves.length > 0) {
            let sub = this.fleetService.moveFleets(plannedMoves).subscribe(resp => {
                if (resp) {
                    moveDone = true;
                }
            });
            this.subscriptions.push(sub);
        }

        if (toCancel.length > 0) {
            const ids = toCancel.map(f => f.idFleet);
            let sub = this.fleetService.cancelMovement(ids).subscribe(resp => {
                if (resp) {
                    cancelDone = true;
                }
            });
            this.subscriptions.push(sub);
        }

        let numberObservable = timer(0, 100);
        let sub = numberObservable.subscribe(() => {
            if (moveDone && cancelDone) {
                this.createStarMap();
                sub.unsubscribe();
            }
        });
        this.subscriptions.push(sub);

    }

    ngAfterViewInit(): void {
        this.createCanvas("star-system-canvas", '#starsystem');
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.starSystemSelectionInputDefinition]) {
            this.createStarMap();
        }
    }

    private createStarMap() {
        this.starMapCommService.clear(1);
        this.starMapCommService.deselect();
        this.clearData();
        if (!!this.starSystemSelectionInput) {
            let sub = this.starMapApi.getStarSystem(this.starSystemSelectionInput.idStarSystem)
                .subscribe(system => {
                    this.createCanvas("star-system-canvas", '#starsystem');
                    this.system = system;
                    this.planets = system.planets;
                    this.setPlanetsByOrbit(system);
                    this.drawOrbits(system);
                });
            this.subscriptions.push(sub);

            sub = this.fleetService.getFleetsBySystem(this.starSystemSelectionInput.idStarSystem)
                .subscribe(resp => {
                    this.createCanvas("star-system-canvas", '#starsystem');
                    this.setFleets(resp);
                });
            this.subscriptions.push(sub);
        }
    }
}
