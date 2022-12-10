import {AfterViewInit, Component, ViewEncapsulation} from '@angular/core';
import {AbstractId, Fleet, FleetApiService, FleetDistributionPerUser, FleetMarker, FleetMove, FleetOrbit, StarMapApiService, StarSystem} from "../../../../services/swagger";
import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.draggable.js'
import {OrbitDefinition} from "../orbit-definition";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {InterstellarFleetDisplayComponent} from "../../../display-elements/interstellar-fleet-display/interstellar-fleet-display.component";
import {InterstellarViewHelper} from "../interstellar-view-helper";
import {SpinnerService} from "../../../../services/spinner.service";
import {TranslateService} from "@ngx-translate/core";
import {BackgroundService} from "../../../../services/background.service";
import {DialogConfigHelper} from "../../../../DialogConfigHelper";

@Component({
    selector: 'app-universe-map-view',
    templateUrl: './universe-map-view.component.html',
    styleUrls: ['./universe-map-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UniverseMapViewComponent extends InterstellarViewHelper implements AfterViewInit {

    knownStarSystems: StarSystem[] = [];

    fleetDistributionPerUsers: FleetDistributionPerUser[] = [];

    private userFleetInfoDialog?: MatDialogRef<any>;

    constructor(private starMapApi: StarMapApiService,
                private fleetApi: FleetApiService,
                tokenStorage: TokenStorage,
                private dialog: MatDialog,
                private spinnerService: SpinnerService,
                private backgroundService: BackgroundService,
                private translate: TranslateService) {
        super(tokenStorage);

        // just make sure that the key exists
        this.translate.get('star-map.universe-map.loading-spinner-message');

        let sub = this.starMapCommService.getInterstellarMoveEmitter().subscribe(resp => this.moveFleet(resp));
        this.subscriptions.push(sub);
    }

    zoomLevel: number = 1;

    ngAfterViewInit(): void {
        this.createCanvas("universe-canvas", '#universe');
        this.createUniverseMap();
    }

    private createUniverseMap() {
        this.spinnerService.activateSpinner('star-map.universe-map.loading-spinner-message');
        this.starMapCommService.clear();
        this.starMapCommService.deselect();
        let outerSub = this.backgroundService.getStarSystems().subscribe(resp => {
            this.knownStarSystems = resp;

            this.clearCanvas();
            this.knownStarSystems.forEach((system) => this.knownStarSystemsByOrbit.set(system.orbit, system));
            let orbitDefinitions: OrbitDefinition[] = OrbitDefinition.getOrbitDefinitionsForStarSystem(this.tokenStorage.getUserID(), this.knownStarSystems);
            this.setOrbits(this.canvas!, orbitDefinitions);
            let sub = this.fleetApi.getFleetDistribution().subscribe(resp => {
                this.fleetDistributionPerUsers = resp;
                this.setFleetsAtSystem(this.canvas!, resp, this.dblClickForFleet);
            });
            this.subscriptions.push(sub);
            sub = this.fleetApi.getInterstellarMovingFleets().subscribe(resp => {
                this.setFleetsInInterstellarMotion(this.canvas!, resp, this.dblClickForMovingFleet);
            });
            this.subscriptions.push(sub);
            this.spinnerService.deactivateSpinner();
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

    openFleetInfoDialogForFleetInMotion(fleet?: FleetMarker) {
        if (!fleet || !fleet.move || !fleet.move.targetOrbit.system) {
            return;
        }
        // todo if open dont open again
        const dialogConfig = DialogConfigHelper.createDialog();

        const fleets = [fleet];
        let dialogData = new DialogData('The ' + fleet.name + ' onwards to ' + fleet.move.targetOrbit.system.name);

        dialogData.addDialogDataPerTemplate(InterstellarFleetDisplayComponent,
            ['fleets'],
            [fleets]);
        dialogConfig.data = dialogData;
        let dialogRef: MatDialogRef<any> = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
        });
        this.userFleetInfoDialog = dialogRef;
    }

    private dblClickForFleet = (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => {
        let owner = this.getFleetOwnerForOwnerByEvent(event);
        if (!owner) {
            let text = this.getFleetTextByEvent(event);
            if (!!text) {
                owner = this.getFleetOwnerByText(text);
            }
        }
        this.openFleetInfoDialog(owner, fleetOrbit?.system)
    }

    openFleetInfoDialog(owner?: AbstractId, system?: StarSystem) {
        if (!owner || !system) {
            return;
        }
        // todo if open dont open again
        const dialogConfig = DialogConfigHelper.createDialog();

        let dialogData = new DialogData('Fleets of ' + owner.name + ' in ' + system.name);
        let dialogRef: MatDialogRef<any> | undefined;
        this.fleetApi.getFleetsBySystemAndOwner(system.idStarSystem, owner.id)
            .subscribe((resp: Fleet[]) => {
                dialogData.addDialogDataPerTemplate(InterstellarFleetDisplayComponent,
                    ['fleets'],
                    [resp]);
                dialogConfig.data = dialogData;
                dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
            });

        if (!!dialogRef) {
            dialogRef.afterClosed().subscribe(result => {
            });
            this.userFleetInfoDialog = dialogRef;
        }
    }

    private moveFleet(plannedMoves: FleetMove[]) {
        let sub = this.fleetApi.moveFleets(plannedMoves).subscribe(resp => {
            if (resp) {
                this.createUniverseMap();
            }
        });
        this.subscriptions.push(sub);
    }
}
