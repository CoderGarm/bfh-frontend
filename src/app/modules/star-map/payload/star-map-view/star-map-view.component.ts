import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetMerge, FleetMove, StarMapApiService, StarSystem} from "../../../../services/swagger";
import {SystemViewHelper} from "../system-view-helper";
import {StellarMovement} from "../../../../star-map-communication.service";
import {timer} from "rxjs";

@Component({
    selector: 'app-star-map-view',
    templateUrl: './star-map-view.component.html',
    styleUrls: ['./star-map-view.component.scss']
})
export class StarMapViewComponent extends SystemViewHelper implements OnInit, OnChanges {

    @Input()
    starSystem?: StarSystem;

    constructor(private starMapApi: StarMapApiService,
                private fleetService: FleetApiService) {
        super();

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
            let sub = this.fleetService.moveFleets(plannedMoves).subscribe(resp => moveDone = !!resp);
            this.subscriptions.push(sub);
        }

        if (toCancel.length > 0) {
            const ids = toCancel.map(f => f.idFleet);
            let sub = this.fleetService.cancelMovement(ids).subscribe(resp => cancelDone = resp);
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

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.createStarMap();
    }

    private createStarMap() {
        this.starMapCommService.clear(1);
        this.starMapCommService.deselect();
        this.clearData();
        if (!!this.starSystem) {
            this.createCanvas("star-system-canvas", '#starsystem');
            this.setPlanetsByOrbit(this.starSystem);
            this.drawOrbits(this.starSystem);

            const sub = this.fleetService.getFleetsBySystem(this.starSystem.idStarSystem)
                .subscribe(resp => this.setFleets(resp));
            this.subscriptions.push(sub);
        }
    }
}
