import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EViewBoxType, ViewHelper} from "../ViewHelper";
import {SVG} from "@svgdotjs/svg.js";
import {
    Fleet,
    FleetApiService,
    FleetMerge,
    FleetMove,
    FleetOrbit,
    Move,
    Orbit,
    Planet,
    StarMapApiService,
    StarSystem
} from "../../../../services/swagger";
import {Subscription} from "rxjs";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {FleetMergeEditComponent} from "../../../display-elements/fleet-merge-edit/fleet-merge-edit.component";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {FleetMoveEditComponent} from "../../../display-elements/fleet-move-edit/fleet-move-edit.component";
import {FleetDisplayComponent} from "../../../display-elements/fleet-display/fleet-display.component";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";

@Component({
    selector: 'app-star-map-view',
    templateUrl: './star-map-view.component.html',
    styleUrls: ['./star-map-view.component.scss']
})
export class StarMapViewComponent extends ViewHelper implements AfterViewInit, OnChanges {

    private subscriptions: Subscription[] = [];

    @Input()
    starSystemSelectionInput?: StarSystem;
    private starSystemSelectionInputDefinition: string = "starSystemSelectionInput";

    planets: Planet[] = [];

    private fleetInfoDialog?: MatDialogRef<any>;

    constructor(private starMapApi: StarMapApiService,
                private fleetApi: FleetApiService,
                private tokenStorage: TokenStorage,
                private dialog: MatDialog) {
        super();
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
                .subscribe(planets => {
                    this.planets = planets;
                    if (!this.canvas) {
                        this.createCanvas()
                    }

                    let planetsByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();
                    planets.map((system) => planetsByOrbit.set(system.orbit, system));
                    this.setOrbits(this.canvas!, EViewBoxType.STAR_SYSTEM, planetsByOrbit.keys(), this.clickEventForPlanet);
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
                    fleets.filter(fleet => !!fleet.orbit && !!fleet.orbit.planet).map((fleet) => fleetsInOrbit.set(fleet.orbit!, fleet));
                    this.setFleetsInOrbits(this.canvas!,
                        fleetsInOrbit,
                        this.cblClickForFleet,
                        this.dragEndForFleet);

                    let fleetsInMotion: Map<Move, Fleet[]> = new Map<Move, Fleet[]>();
                    fleets.filter(fleet => !!fleet.move).map((fleet) => {
                        if (!fleet.move) {
                            throw new Error("This fleet is in motion and should know this.");
                        }
                        let move: Move = {
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
                        this.cblClickForFleet,
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

        if (!!draggedFleet && !!orbit && !inMotion && !!draggedFleet.orbit && !!draggedFleet.orbit.planet) {
            let sameOrbit = ViewHelper.isSameOrbit(draggedFleet.orbit.planet.orbit, orbit);
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
        dialogData.addDialogDataPerTemplate(FleetMoveEditComponent,
            ['fleetInput', 'targetPlanet'],
            [draggedFleet, planets[0]]);
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
                    idTargetPlanet: planets[0].idPlanet
                }
                let sub = this.fleetApi.moveFleet(userID, move).subscribe(resp => {
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
                let sub = this.fleetApi.mergeFleets(userID, merge).subscribe(resp => {
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
    private cblClickForFleet = (event: PointerEvent) => {
        let fleet = this.getFleetByEvent(event);
        if (!fleet) {
            let text = this.getFleetTextByEvent(event);
            if (!!text) {
                fleet = this.getFleetByText(text);
            }
        }
        this.openFleetInfoDialog(fleet)
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
                dialogData.addDialogDataPerTemplate(FleetMoveEditComponent,
                    ['fleetInput', 'targetPlanet', 'callback'],
                    [fleet, fleet.move.targetOrbit.planet, this.callbackFleetMove]);
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
        this.canvas = SVG().id("star-system-canvas").addTo('#starsystem').panZoom();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
