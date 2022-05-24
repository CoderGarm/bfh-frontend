import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import {SVG} from "@svgdotjs/svg.js";
import {Fleet, FleetApiService, FleetMerge, FleetMove, FleetOrbit, Move, Orbit, Planet, StarMapApiService, StarSystem} from "../../../../services/swagger";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {FleetMergeEditComponent} from "../../../display-elements/fleet-merge-edit/fleet-merge-edit.component";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {FleetMoveEditComponent} from "../../../display-elements/fleet-move-edit/fleet-move-edit.component";
import {FleetDisplayComponent} from "../../../display-elements/fleet-display/fleet-display.component";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {FleetMoveDisplayComponent} from "../../../display-elements/fleet-move-display/fleet-move-display.component";
import {SystemViewHelper} from "../system-view-helper";
import {BasicViewHelper} from "../../../../basic-view-helper";

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
                private fleetApi: FleetApiService,
                tokenStorage: TokenStorage,
                private dialog: MatDialog) {
        super(tokenStorage);
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
        if (!!this.starSystemSelectionInput) {
            this.clearCanvas();
            let sub = this.starMapApi.getStarSystem(this.starSystemSelectionInput.idStarSystem)
                .subscribe(system => {
                    this.system = system;
                    this.planets = system.planets;
                    if (!this.canvas) {
                        this.createCanvas()
                    }
                    this.setOrbits(this.canvas!, system, this.clickEventForPlanet);
                });
            this.subscriptions.push(sub);

            sub = this.fleetApi.getFleetsBySystem(this.starSystemSelectionInput.idStarSystem)
                .subscribe(resp => {
                    // every fleet in an orbit must have an orbit defined, logical
                    let fleets: Fleet[] = resp;
                    if (!this.canvas) {
                        this.createCanvas()
                    }

                    let fleetsInOrbit: Map<FleetOrbit, Fleet> = new Map<FleetOrbit, Fleet>();
                    fleets.filter(fleet => !!fleet.orbit && !!fleet.orbit.orbit).map((fleet) => fleetsInOrbit.set(fleet.orbit!, fleet));
                    this.setFleetsInOrbits(this.canvas!,
                        fleetsInOrbit,
                        this.dblClickForFleet,
                        this.dragEndForFleet);

                    let fleetsInMotion: Map<Move, Fleet[]> = new Map<Move, Fleet[]>();
                    fleets.filter(fleet => !!fleet.move).map((fleet) => {
                        if (!fleet.move) {
                            throw new Error("This fleet is in motion and should know this.");
                        }
                        let move: Move = {
                            idFleetInMotion: -1, // this is to ignore the id but it must be present
                            startOrbit: fleet.move.startOrbit,
                            targetOrbit: fleet.move.targetOrbit,
                            originalDuration: fleet.move.originalDuration,
                            moveDoneAtZero: fleet.move.moveDoneAtZero
                        };

                        move.moveDoneAtZero = 0;
                        let arr = fleetsInMotion.get(move);
                        if (!arr) {
                            arr = [fleet];
                        } else if (!arr.includes(fleet)) {
                            arr.push(fleet);
                        }
                        fleetsInMotion.set(move, arr)
                    });
                    this.setFleetsInMotion(this.canvas!,
                        fleetsInMotion,
                        this.dblClickForFleet,
                        this.dragEndForFleet)
                });
            this.subscriptions.push(sub);
        } else {
            this.clearCanvas();
        }
    }

    /**
     * call back function for using a click at an element
     *
     * @param event
     */
    private clickEventForPlanet = (event: PointerEvent) => {
        let orbitOfCelestialByEvent: Orbit | undefined = this.getOrbitOfCelestialByEvent(event);
        console.log(orbitOfCelestialByEvent);
    }

    /**
     * drag end callback for a dragged fleet to another fleet or an orbit
     *
     * @param draggedFleet the moved fleet
     * @param targetFleet the destination if it is another fleet
     * @param orbit the destination if it is an orbit
     */
    private dragEndForFleet = (draggedFleet?: Fleet, targetFleet?: Fleet, orbit?: Orbit) => {
        if (!draggedFleet) {
            return;
        }
        // todo if open dont open again
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        let inMotion = draggedFleet.move;
        if (!!draggedFleet && !inMotion && !!targetFleet && !targetFleet.move) {
            this.createAndOpenFleetMergeDialog(dialogConfig, draggedFleet, targetFleet);
            return;
        }

        if (!!draggedFleet && !!orbit && !inMotion && !!draggedFleet.orbit) {
            let sameOrbit: boolean = false;
            if (!!draggedFleet.orbit.orbit) {
                sameOrbit = this.isSameOrbit(draggedFleet.orbit.orbit, orbit);
            }
            if (!sameOrbit) {
                this.createAndOpenFleetMoveDialog(dialogConfig, draggedFleet, orbit);
                return;
            }
        }
    }

    /**
     * creates and opens the fleet move dialog
     *
     * @param dialogConfig the base dialog config
     * @param draggedFleet the by the user moved fleet
     * @param orbit the designated target
     * @private
     */
    private createAndOpenFleetMoveDialog(dialogConfig: MatDialogConfig, draggedFleet: Fleet, orbit: Orbit) {
        let planets = this.planets.filter(p => p.orbit === orbit);
        if (!planets || planets.length != 1) {
            throw new Error("No orbit should have more than one planet.");
        }

        let dialogData = new DialogData("move fleets");
        let fo: FleetOrbit = {
            orbit: planets[0].orbit,
            system: this.system
        }
        dialogData.addDialogDataPerTemplate(FleetMoveEditComponent,
            ['fleetInput', 'targetOrbit'],
            [draggedFleet, fo]);
        dialogConfig.data = dialogData;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            if (result) {
                let userID = this.tokenStorage.getUserID();
                if (!userID) {
                    return;
                }
                let move: FleetMove = {
                    idFleetToMove: draggedFleet.idFleet,
                    destinationOrbit: planets[0].orbit,
                    idDestinationSystem: planets[0].idStarSystem
                }
                let sub = this.fleetApi.moveFleet(move, userID).subscribe(resp => {
                    if (resp) {
                        this.createStarMap();
                    }
                });
                this.subscriptions.push(sub);
            }
        });
    }

    /**
     * creates and opens the fleet merge dialog
     *
     * @param dialogConfig the base dialog config
     * @param draggedFleet the by the user moved fleet
     * @param targetFleet the fleet which is the target of the movement
     * @private
     */
    private createAndOpenFleetMergeDialog(dialogConfig: MatDialogConfig, draggedFleet: Fleet, targetFleet: Fleet) {

        let dialogData = new DialogData("merge fleets");

        dialogData.addDialogDataPerTemplate(FleetMergeEditComponent,
            ['fleetSubject', 'fleetObject'],
            [draggedFleet, targetFleet]);
        dialogConfig.data = dialogData;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            if (result) {
                let userID = this.tokenStorage.getUserID();
                if (!userID) {
                    return;
                }
                let merge: FleetMerge = {
                    idFleetToMerge: targetFleet.idFleet,
                    idFleetMergeTarget: draggedFleet.idFleet
                }
                let sub = this.fleetApi.mergeFleets(merge, userID).subscribe(resp => {
                    if (resp) {
                        this.createStarMap();
                    }
                });
                this.subscriptions.push(sub);
            }
        });
    }

    /**
     * call back function for using a click at an element
     *
     * @param event
     */
    private dblClickForFleet = (event: PointerEvent) => {
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
    openFleetInfoDialog(fleet: Fleet | undefined) {
        if (!!fleet) {
            // todo if open dont open again
            const dialogConfig = new MatDialogConfig();

            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;

            let dialogData = new DialogData(fleet.name);
            dialogData.addDialogDataPerTemplate(FleetDisplayComponent,
                ['fleetInput'],
                [fleet]);
            dialogData.addDialogDataPerTemplate(SpacecraftCapabilitiesDisplayComponent,
                ['fleetInput'],
                [fleet]);
            if (!!fleet.move) {
                let userID = this.tokenStorage.getUserID();
                if (fleet.owner.idUser == userID) {
                    dialogData.addDialogDataPerTemplate(FleetMoveEditComponent,
                        ['fleetInput', 'targetOrbit', 'callback'],
                        [fleet, fleet.move.targetOrbit, this.callbackFleetMove]);
                } else {
                    dialogData.addDialogDataPerTemplate(FleetMoveDisplayComponent,
                        ['fleetInput'],
                        [fleet]);
                }
            }
            dialogConfig.data = dialogData;
            const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(result => {
                console.log(`Dialog result: ${result}`);
            });
            this.fleetInfoDialog = dialogRef;
        }
    }

    /**
     * called if the cancel flight button is pressed
     * @param fleet the fleet which flight is cancelled
     */
    private callbackFleetMove = (fleet: any) => {
        let userID = this.tokenStorage.getUserID();
        if (!!userID && !!fleet && !!fleet.move) {
            let sub = this.fleetApi.cancelMovement(userID, fleet.idFleet).subscribe(resp => {
                this.fleetInfoDialog!.close(resp);
                this.createStarMap();
            });
            this.subscriptions.push(sub);
        }
    }

    /**
     * necessary to create svg after template is rendered
     * @private
     */
    private createCanvas() {
        this.canvas = SVG().id("star-system-canvas").addTo('#starsystem').panZoom(BasicViewHelper.PAN_ZOOM_OPTIONS);
    }

    ngAfterViewInit(): void {
    }
}
