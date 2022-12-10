import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService, FleetMarker, FleetMerge, FleetMove, FleetOrbit, Orbit, Planet, StarMapApiService, StarSystem} from "../../../../services/swagger";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {FleetMergeEditComponent} from "../../../display-elements/fleet-merge-edit/fleet-merge-edit.component";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {FleetDisplayComponent} from "../../../display-elements/fleet-display/fleet-display.component";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {FleetMoveDisplayComponent} from "../../../display-elements/fleet-move-display/fleet-move-display.component";
import {SystemViewHelper} from "../system-view-helper";
import {DialogConfigHelper} from "../../../../DialogConfigHelper";
import {ManualTransportComponent} from "../../../display-elements/manual-transport/manual-transport.component";

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

    private fleetInfoDialog?: MatDialogRef<any>;

    constructor(private starMapApi: StarMapApiService,
                private fleetService: FleetApiService,
                tokenStorage: TokenStorage,
                private dialog: MatDialog) {
        super(tokenStorage);

        let sub = this.starMapCommService.getStellarMoveEmitter().subscribe(resp => this.moveFleet(resp));
        this.subscriptions.push(sub);
        sub = this.starMapCommService.getCancelMovementEmitter().subscribe(resp => this.cancelMovement(resp))
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
                    this.setFleetsInOrbits(this.canvas!, fleetsInOrbit, this.dblClickForFleet);

                    let fleetsInMotion: FleetMarker[] = fleets.filter(fleet => !!fleet.move);
                    this.setFleetsInMotion(this.canvas!, fleetsInMotion, this.dblClickForFleet)
                });
            this.subscriptions.push(sub);
        } else {
            this.clearCanvas();
        }
    }

    /**
     * drag end callback for a dragged fleet to another fleet or an orbit
     *
     * @param draggedFleet the moved fleet
     * @param targetFleet the destination if it is another fleet
     * @param orbit the destination if it is an orbit
     */
    private dragEndForFleet = (draggedFleet?: FleetMarker, targetFleet?: FleetMarker, orbit?: Orbit) => {
        if (!draggedFleet) {
            return;
        }
        // fixme merge
        const dialogConfig = DialogConfigHelper.createDialog();

        let inMotion = draggedFleet.move;
        if (!!draggedFleet && !inMotion && !!targetFleet && !targetFleet.move) {
            this.createAndOpenFleetMergeDialog(dialogConfig, draggedFleet, targetFleet);
            return;
        }
    }

    /**
     * creates and opens the fleet merge dialog
     *
     * @param dialogConfig the base dialog config
     * @param draggedFleet the by the user moved fleet
     * @param targetFleet the fleet which is the target of the movement
     * @private
     */
    private createAndOpenFleetMergeDialog(dialogConfig: MatDialogConfig, draggedFleet: FleetMarker, targetFleet: FleetMarker) {

        let dialogData = new DialogData("merge fleets");

        dialogData.addDialogDataPerTemplate(FleetMergeEditComponent,
            ['fleetSubject', 'fleetObject'],
            [draggedFleet, targetFleet]);
        dialogConfig.data = dialogData;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let userID = this.tokenStorage.getUserID();
                if (!userID) {
                    return;
                }
                let merge: FleetMerge = {
                    idFleetToMerge: targetFleet.fleet.id,
                    idFleetMergeTarget: draggedFleet.fleet.id
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

    private dblClickForFleet = (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => {
        let fleet = this.getFleetByEvent(event);
        if (!fleet) {
            let text = this.getFleetTextByEvent(event);
            if (!!text) {
                fleet = this.getFleetByText(text);
            }
        }
        this.openFleetInfoDialog(fleet);
    }

    /**
     * opens the fleet info dialog
     * @param fleet
     */
    openFleetInfoDialog(fleet: FleetMarker | undefined) {
        if (!!fleet) {
            // todo if open dont open again
            const dialogConfig = DialogConfigHelper.createDialog();

            let dialogData = new DialogData(fleet.name);
            dialogData.addDialogDataPerTemplate(FleetDisplayComponent,
                ['fleetInput'],
                [fleet]);
            dialogData.addDialogDataPerTemplate(SpacecraftCapabilitiesDisplayComponent,
                ['fleetMarker'],
                [fleet]);
            dialogData.addDialogDataPerTemplate(ManualTransportComponent,
                ['fleet'],
                [fleet]);
            if (!!fleet.move) {
                let userID = this.tokenStorage.getUserID();
                if (fleet.owner.id != userID) {
                    dialogData.addDialogDataPerTemplate(FleetMoveDisplayComponent,
                        ['fleetInput'],
                        [fleet]);
                }
            }
            dialogConfig.data = dialogData;
            const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(result => {
            });
            this.fleetInfoDialog = dialogRef;
        }
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
