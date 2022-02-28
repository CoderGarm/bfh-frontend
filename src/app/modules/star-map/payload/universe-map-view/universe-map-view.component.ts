import {AfterViewInit, Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import {Fleet, FleetApiService, FleetDistributionPerUser, FleetMove, Move, Orbit, StarMapApiService, StarSystem, UserJson} from "../../../../services/swagger";
import {SVG} from "@svgdotjs/svg.js";
import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.draggable.js'
import {SystemViewHelper} from "../system-view-helper";
import {OrbitDefinition} from "../orbit-definition";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {InterstellarFleetDisplayComponent} from "../../../display-elements/interstellar-fleet-display/interstellar-fleet-display.component";
import {InterstellarFleetMovementEditComponent} from "../../../display-elements/interstellar-fleet-movement-edit/interstellar-fleet-movement-edit.component";
import {InterstellarViewHelper} from "../interstellar-view-helper";

@Component({
    selector: 'app-universe-map-view',
    templateUrl: './universe-map-view.component.html',
    styleUrls: ['./universe-map-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UniverseMapViewComponent extends InterstellarViewHelper implements AfterViewInit {

    /**
     * all known star systems
     */
    knownStarSystems: StarSystem[] = [];

    private knownStarSystemsByOrbit: Map<Orbit, StarSystem> = new Map<Orbit, StarSystem>();

    @Output()
    starSystemSelectionOutput: EventEmitter<StarSystem> = new EventEmitter<StarSystem>();

    fleetDistributionPerUsers: FleetDistributionPerUser[] = [];

    private userFleetInfoDialog?: MatDialogRef<any>;

    /**
     * the planned moves which was selected in the dialog
     */
    plannedMoves: FleetMove[] = [];

    constructor(private starMapApi: StarMapApiService,
                private fleetApi: FleetApiService,
                tokenStorage: TokenStorage,
                private dialog: MatDialog) {
        super(tokenStorage);
    }

    ngAfterViewInit(): void {
        this.canvas = SVG().id("universe-canvas").addTo('#universe').panZoom();
        this.createUniverseMap();
    }

    private createUniverseMap() {
        let outerSub = this.starMapApi.getStarSystems().subscribe(resp => {
            this.knownStarSystems = resp;

            this.clearCanvas();
            this.knownStarSystems.forEach((system) => this.knownStarSystemsByOrbit.set(system.orbit, system));
            let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForUniverse(this.tokenStorage.getUserID(), this.knownStarSystems);
            this.setOrbits(this.canvas!, orbitDefinitions, this.clickEventForStarSystem);
            let sub = this.fleetApi.getFleetDistribution().subscribe(resp => {
                this.fleetDistributionPerUsers = resp;
                this.setFleetsAtSystem(this.canvas!, resp, this.dblClickForFleet, this.dragEndForFleet);
            });
            this.subscriptions.push(sub);
            sub = this.fleetApi.getInterstellarMovingFleets().subscribe(resp => {
                let fleetsInMotion: Map<Move, Fleet[]> = new Map<Move, Fleet[]>();
                resp.filter(fleet => !!fleet.move).map((fleet) => {
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
                this.setFleetsInInterstellarMotion(this.canvas!, fleetsInMotion, this.dblClickForMovingFleet);
            });
            this.subscriptions.push(sub);
        });
        this.subscriptions.push(outerSub);
    }

    private dblClickForMovingFleet = (event: PointerEvent) => {
        let fleet = this.getFleetByEvent(event);
        if (!fleet) {
            let text = this.getFleetTextByEvent(event);
            if (!!text) {
                fleet = this.getFleetByText(text);
            }
        }
        this.openFleetInfoDialogForFleetInMotion(fleet);
    }

    openFleetInfoDialogForFleetInMotion(fleet?: Fleet) {
        if (!fleet || !fleet.move || !fleet.move.targetOrbit.system) {
            return;
        }
        // todo if open dont open again
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        const fleets = [fleet];
        let dialogData = new DialogData('The ' + fleet.name + ' onwards to ' + fleet.move.targetOrbit.system.name);

        dialogData.addDialogDataPerTemplate(InterstellarFleetDisplayComponent,
            ['fleets'],
            [fleets]);
        dialogConfig.data = dialogData;
        let dialogRef: MatDialogRef<any> = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
        this.userFleetInfoDialog = dialogRef;
    }

    /**
     * call back function for using a click at an element
     * @param event
     * @param system
     */
    private dblClickForFleet = (event: PointerEvent, system: StarSystem) => {
        let owner = this.getFleetOwnerForOwnerByEvent(event);
        if (!owner) {
            let text = this.getFleetTextByEvent(event);
            if (!!text) {
                owner = this.getFleetOwnerByText(text);
            }
        }
        this.openFleetInfoDialog(owner, system)
    }

    /**
     * opens the owner fleet info dialog
     * @param owner
     * @param system
     */
    openFleetInfoDialog(owner?: UserJson, system?: StarSystem) {
        if (!owner || !system) {
            return;
        }
        // todo if open dont open again
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        let dialogData = new DialogData('Fleets of ' + owner.username + ' in ' + system.name);
        let dialogRef: MatDialogRef<any> | undefined;
        this.fleetApi.getFleetsBySystemAndOwner(system.idStarSystem, owner.idUser)
            .subscribe((resp: Fleet[]) => {
                dialogData.addDialogDataPerTemplate(InterstellarFleetDisplayComponent,
                    ['fleets'],
                    [resp]);
                dialogConfig.data = dialogData;
                dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
            });

        if (!!dialogRef) {
            dialogRef.afterClosed().subscribe(result => {
                console.log(`Dialog result: ${result}`);
            });
            this.userFleetInfoDialog = dialogRef;
        }
    }

    /**
     * drag end callback for a dragged fleet to another fleet or an orbit
     *
     * @param draggedFleetSharkForUser the moved fleet
     * @param fromSystem the system where the move comes from
     * @param targetOrbit the destination orbit
     */
    private dragEndForFleet = (draggedFleetSharkForUser?: UserJson, fromSystem?: StarSystem, targetOrbit?: Orbit) => {
        if (!draggedFleetSharkForUser || !fromSystem || !targetOrbit) {
            return;
        }
        // todo if open dont open again
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        let sameOrbit = SystemViewHelper.isSameOrbit(fromSystem.orbit, targetOrbit);
        if (!sameOrbit) {
            this.createAndOpenFleetMoveDialog(dialogConfig, draggedFleetSharkForUser, fromSystem, targetOrbit);
            return;
        }
    }

    private createAndOpenFleetMoveDialog(dialogConfig: MatDialogConfig, draggedFleetSharkForUser: UserJson, fromSystem: StarSystem, targetOrbit: Orbit) {
        let starSystems = this.knownStarSystems.filter(p => p.orbit === targetOrbit);
        if (!starSystems || starSystems.length != 1) {
            throw new Error("No orbit should have more than one planet.");
        }

        let dialogData = new DialogData('Fleets of ' + draggedFleetSharkForUser.username + ' in ' + fromSystem.name);
        let dialogRef: MatDialogRef<any> | undefined;

        this.fleetApi.getFleetsBySystemAndOwner(fromSystem.idStarSystem, draggedFleetSharkForUser.idUser)
            .subscribe((resp: Fleet[]) => {
                dialogData.addDialogDataPerTemplate(InterstellarFleetMovementEditComponent,
                    ['fleets', 'destination', 'callback'],
                    [resp, starSystems[0], this.callbackFleetMove]);
                dialogConfig.data = dialogData;
                dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

                if (!!dialogRef) {
                    dialogRef.afterClosed().subscribe(result => {
                        if (result && this.plannedMoves.length > 0) {
                            let userID = this.tokenStorage.getUserID();
                            let sub = this.fleetApi.moveFleets(userID, this.plannedMoves).subscribe(resp => {
                                if (resp) {
                                    this.createUniverseMap();
                                }
                            });
                            this.subscriptions.push(sub);
                        }
                    });
                }
            });
    }

    private callbackFleetMove = (fleets: Fleet[], plannedMovements: Move[]) => {
        let userID = this.tokenStorage.getUserID();
        if (!userID) {
            return;
        }
        const m: Map<number, Move> = new Map<number, Move>();
        plannedMovements.forEach(move => {
            m.set(move.idFleetInMotion, move);
        })
        this.plannedMoves = fleets.map(fleet => {
            let plannedMove: Move | undefined = m.get(fleet.idFleet);
            if (!plannedMove) {
                throw new Error("There should be a movement already planned and validated.");
            }
            let move: FleetMove = {
                idFleetToMove: fleet.idFleet,
                idDestinationSystem: plannedMove.targetOrbit.system?.idStarSystem,
                destinationOrbit: plannedMove.targetOrbit.orbit
            }
            return move;
        });
    }

    /**
     * call back function for using a click at an element
     *
     * @param event
     */
    private clickEventForStarSystem = (event: PointerEvent) => {
        let orbitByID = this.getOrbitOfCelestialByEvent(event);
        if (!!orbitByID) {
            let system = this.knownStarSystemsByOrbit.get(orbitByID);
            this.starSystemSelectionOutput.emit(system);
        }
    };
}
