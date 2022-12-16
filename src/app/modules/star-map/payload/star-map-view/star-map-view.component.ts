import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetMarker, FleetMerge, FleetMove, FleetOrbit, Planet, StarMapApiService, StarSystem} from "../../../../services/swagger";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {FleetMergeEditComponent} from "../../../display-elements/fleet-merge-edit/fleet-merge-edit.component";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {SystemViewHelper} from "../system-view-helper";
import {DialogConfigHelper} from "../../../../DialogConfigHelper";

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

        let sub = this.starMapCommService.getStellarMoveEmitter().subscribe(resp => this.moveFleet(resp));
        this.subscriptions.push(sub);
        sub = this.starMapCommService.getCancelMovementEmitter().subscribe(resp => this.cancelMovement(resp))
        this.subscriptions.push(sub);
        sub = this.starMapCommService.getMergeFleetsEmitter().subscribe(resp => this.createAndOpenFleetMergeDialog(resp))
        this.subscriptions.push(sub);
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes[this.starSystemSelectionInputDefinition]) {
            this.createStarMap();
        }
    }

    /**
     * main method of this fuckin' shit - creates everything by the current data
     * @private
     */
    private createStarMap() {
        this.starMapCommService.clear(1);
        this.starMapCommService.deselect();
        if (!!this.starSystemSelectionInput) {
            this.clearCanvas();
            let sub = this.starMapApi.getStarSystem(this.starSystemSelectionInput.idStarSystem)
                .subscribe(system => {
                    this.system = system;
                    this.planets = system.planets;
                    if (!this.canvas) {
                        this.createCanvas("star-system-canvas", '#starsystem')
                    }
                    system.planets.forEach(p => this.planetsByOrbit.set(p.orbit, p));
                    this.setOrbits(this.canvas!, system);
                });
            this.subscriptions.push(sub);

            sub = this.fleetService.getFleetsBySystem(this.starSystemSelectionInput.idStarSystem)
                .subscribe(resp => {
                    // every fleet in an orbit must have an orbit defined, logical
                    let fleets: FleetMarker[] = resp;
                    if (!this.canvas) {
                        this.createCanvas("star-system-canvas", '#starsystem')
                    }

                    let fleetsInOrbit: Map<FleetOrbit, FleetMarker> = new Map<FleetOrbit, FleetMarker>();
                    fleets.filter(fleet => !!fleet.orbit && !!fleet.orbit.orbit).map((fleet) => fleetsInOrbit.set(fleet.orbit!, fleet));
                    this.setFleetsInOrbits(fleetsInOrbit);

                    let fleetsInMotion: FleetMarker[] = fleets.filter(fleet => !!fleet.move);
                    this.setFleetsInMotion(fleetsInMotion)
                });
            this.subscriptions.push(sub);
        } else {
            this.clearCanvas();
        }
    }

    private createAndOpenFleetMergeDialog(fleets: Fleet[]) {

        const dialogConfig = DialogConfigHelper.createDialog();
        let dialogData = new DialogData("merge fleets");

        const first = fleets[0];
        const second = fleets[1];
        dialogData.addDialogDataPerTemplate(FleetMergeEditComponent,
            ['fleetSubject', 'fleetObject'],
            [first, second]);
        dialogConfig.data = dialogData;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let userID = this.tokenStorage.getUserID();
                if (!userID) {
                    return;
                }
                let merge: FleetMerge = {
                    idFleetToMerge: first.idFleet,
                    idFleetMergeTarget: second.idFleet
                }
                let sub = this.fleetService.mergeFleets(merge, userID).subscribe(resp => {
                    if (resp) {
                        this.createStarMap();
                    }
                });
                this.subscriptions.push(sub);
            }
        });
    }

    private moveFleet(plannedMoves: FleetMove[]) {
        let sub = this.fleetService.moveFleets(plannedMoves).subscribe(resp => {
            if (resp) {
                this.createStarMap();
            }
        });
        this.subscriptions.push(sub);
    }

    private cancelMovement(fleets: Fleet[]) {
        const ids = fleets.map(f => f.idFleet);
        let sub = this.fleetService.cancelMovement(ids).subscribe(resp => {
            if (resp) {
                this.createStarMap();
            }
        });
        this.subscriptions.push(sub);
    }
}
