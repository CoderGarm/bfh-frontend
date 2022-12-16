import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {StarMapCommunicationService} from "../../../../star-map-communication.service";
import {Fleet, FleetApiService} from "../../../../services/swagger";
import {InterstellarFleetDisplayComponent} from "../../../display-elements/interstellar-fleet-display/interstellar-fleet-display.component";
import {DialogConfigHelper} from 'src/app/DialogConfigHelper';
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {FleetDisplayComponent} from "../../../display-elements/fleet-display/fleet-display.component";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {ManualTransportComponent} from "../../../display-elements/manual-transport/manual-transport.component";
import {FleetMoveDisplayComponent} from "../../../display-elements/fleet-move-display/fleet-move-display.component";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {FleetFormationDisplay} from "../../../display-elements/fleet-formation-display/fleet-formation-display.component";


@Component({
    selector: 'app-notch',
    templateUrl: './notch.component.html',
    styleUrls: ['./notch.component.scss']
})
export class NotchComponent implements OnInit, OnChanges, OnDestroy {

    @Input()
    stellarMode: boolean = false;

    commService: StarMapCommunicationService;

    constructor(private dialog: MatDialog,
                private tokenStorage: TokenStorage,
                private fleetService: FleetApiService,
                commService: StarMapCommunicationService) {
        this.commService = commService;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    deselect() {
        this.commService.deselect();
    }

    move() {
        if (this.stellarMode) {
            this.commService.stellarMove();
        } else {
            this.commService.interstellarMove();
        }
    }

    merge() {
        this.commService.merge();
    }

    infoDisabled() {
        return this.commService.infoDisabled();
    }

    moveDisabled() {
        return this.commService.moveDisabled();
    }

    mergeDisabled() {
        return !this.stellarMode || this.commService.mergeDisabled();
    }

    deselectDisabled() {
        return !this.commService.isSelectedFleetMarker();
    }

    cancelMoveDisabled() {
        return !this.stellarMode || this.commService.cancelMoveDisabled();
    }

    ngOnDestroy(): void {
        this.commService.clear();
    }

    cancelMove() {
        this.commService.cancel();
    }

    info() {
        if (this.stellarMode) {
            this.commService.selectedFleets.forEach(fleet => this.openFleetInfoDialog(fleet));
        } else {
            this.openInterstellarDialog();
        }
    }

    openFleetInfoDialog(fleet: Fleet | undefined) {
        if (!!fleet) {
            // fixme change to info vs transport dialog
            const dialogConfig = DialogConfigHelper.createDialog();

            let dialogData = new DialogData(fleet.name);
            dialogData.addDialogDataPerTemplate(FleetDisplayComponent,
                ['fleetInput'],
                [fleet]);
            dialogData.addDialogDataPerTemplate(SpacecraftCapabilitiesDisplayComponent,
                ['fleet'],
                [fleet]);
            dialogData.addDialogDataPerTemplate(ManualTransportComponent,
                ['fleet'],
                [fleet]);
            dialogData.addDialogDataPerTemplate(FleetFormationDisplay,
                ['selectedFleetInput'],
                [fleet]); // fixme display in dialog area body?
            if (!!fleet.move) {
                let userID = this.tokenStorage.getUserID();
                if (fleet.owner.idUser != userID) {
                    dialogData.addDialogDataPerTemplate(FleetMoveDisplayComponent,
                        ['fleetInput'],
                        [fleet]);
                }
            }
            dialogConfig.data = dialogData;
            this.dialog.open(ConfirmDialogComponent, dialogConfig);
        }
    }

    openInterstellarDialog() {
        const dialogConfig = DialogConfigHelper.createDialog();
        let dialogData = new DialogData('Fleets of  owner.name  in  system.name'); // fixme display moving and staying fleets
        dialogData.addDialogDataPerTemplate(InterstellarFleetDisplayComponent,
            ['fleets'],
            [this.commService.selectedFleets]);
        dialogConfig.data = dialogData;
        this.dialog.open(ConfirmDialogComponent, dialogConfig);
    }

    getColSpan(fleet: Fleet) {
        let result: number = 3;
        const length = this.commService.selectedFleets.length;
        const indexOf = this.commService.selectedFleets.indexOf(fleet) + 1;

        const currentRow = Math.ceil(indexOf / 3);

        const diff = length - (currentRow * 3);
        const elementsInLastRow = 3 - -diff;
        if (diff < 0) {
            result = 6 / elementsInLastRow;
        } else {
            result = 2;
        }
        return result;
    }
}
