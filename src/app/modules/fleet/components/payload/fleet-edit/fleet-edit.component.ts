import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EShipClassType, Fleet, FleetApiService, RolePlayApiService, WarShip} from "../../../../../services/swagger";
import {DialogConfigHelper} from "../../../../../services/helper/dialog-config.helper";
import {DialogData} from "../../../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../../../components/confirmation-dialog/confirm-dialog.component";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import {MatDialog} from "@angular/material/dialog";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FormControl, FormGroup} from "@angular/forms";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";

@Component({
    selector: 'app-fleet-edit',
    templateUrl: './fleet-edit.component.html',
    styleUrls: ['./fleet-edit.component.scss']
})
export class FleetEditComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    fleet?: Fleet;

    private hullTypes: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    hullsByType: Map<string, EShipClassType> = new Map<string, EShipClassType>();
    warShipsByType: Map<string, WarShip[]> = new Map<string, WarShip[]>();
    warShipsByTypeAndFlight: Map<string, WarShip[]> = new Map<string, WarShip[]>();
    prefix?: string;

    formGroup: FormGroup = new FormGroup({
        fleetName: new FormControl('')
    });

    noSave: boolean = false;

    constructor(private fleetService: FleetApiService,
                private rolePlayService: RolePlayApiService,
                private snackbar: SnackbarNotificationService,
                private fleetChangeService: FleetEventService,
                private dialog: MatDialog) {
        super();

    }

    ngOnInit() {
        let sub = this.rolePlayService.getShipPrefix().subscribe(resp => {
            if (resp.length == 1) {
                this.prefix = resp[0];
            }
        });
        this.subscriptions.push(sub);

        sub = this.formGroup.controls.fleetName.valueChanges.subscribe(() => this.saveFleetName());
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.detectName();

        if (changes['fleet']) {
            this.loadFleet();
        }
    }


    private loadFleet() {
        this.hullTypes.clear();
        this.hullsByType.clear();
        this.warShipsByType.clear();
        this.warShipsByTypeAndFlight.clear();
        this.sortWarshipsByHull();
    }

    private sortWarshipsByHull() {
        if (!!this.fleet) {
            this.fleet.ships.forEach(warShip => {
                this.hullTypes.set(warShip.shipClass.shipClassType.typeName, warShip.shipClass.shipClassType);
                this.addToTypeList(warShip);
                this.addToTypeAndFlightList(warShip);
            });
        }
    }

    private addToTypeAndFlightList(warShip: WarShip) {
        const key = warShip.shipClass.name + 'm' + warShip.shipClass.mark;
        let warShips: WarShip[] | undefined = this.warShipsByTypeAndFlight.get(key);
        if (!warShips) {
            warShips = [warShip];
        } else {
            warShips.push(warShip);
        }
        this.warShipsByTypeAndFlight.set(key, warShips);
    }

    private addToTypeList(warShip: WarShip) {
        let warShips: WarShip[] | undefined = this.warShipsByType.get(warShip.shipClass.name);
        if (!warShips) {
            warShips = [warShip];
        } else {
            warShips.push(warShip);
        }
        this.warShipsByType.set(warShip.shipClass.name, warShips);
    }

    getHullDescription(typeName: string): string {
        let hull = this.hullsByType.get(typeName);
        if (!!hull) {
            return hull.typeName + ' - ' + hull.description;
        }
        return "";
    }

    private detectName() {
        this.noSave = true;
        if (!!this.fleet) {
            this.formGroup.controls.fleetName.setValue(this.fleet.name);
        } else {
            this.formGroup.controls.fleetName.setValue('');
        }
        this.noSave = false;
    }

    saveFleetName() {
        if (this.noSave) {
            return;
        }
        const name: string = this.formGroup.controls.fleetName.value;
        const disabled = this.formGroup.controls.fleetName.disabled;
        if (disabled || !this.fleet || name.length == 0) {
            return;
        }
        const sub = this.fleetService.renameFleet(this.fleet.idFleet, name)
            .subscribe(resp => {
                if (resp) {
                    this.fleetChangeService.changeName({
                        id: this.fleet!.idFleet,
                        name: name
                    });
                    this.snackbar.notifySave();
                }
            });
        this.subscriptions.push(sub);
    }

    retireFleet() {
        if (!this.fleet) {
            return;
        }
        const sub = this.fleetService.retireFleet(this.fleet.idFleet)
            .subscribe(resp => {
                if (resp) {
                    this.fleetChangeService.retireFleet({
                        id: this.fleet!.idFleet
                    });
                }
            });
        this.subscriptions.push(sub);
    }

    openRetireFleetDialog() {
        const dialogConfig = DialogConfigHelper.createDialog();
        dialogConfig.data = new DialogData("Retire " + this.fleet?.name + '?');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.retireFleet();
            }
        })
    }

    retireShip(warShip: WarShip) {
        this.removeShip(warShip);
        let sub = this.fleetService.retireWarship(warShip.idWarship).subscribe(resp => {
        });
        this.subscriptions.push(sub);
    }

    private removeShip(warShip: WarShip) {
        const ships = this.fleet!.ships.filter(s => s.idWarship === warShip.idWarship);
        ships.forEach(ship => {
            const indexOf = this.fleet!.ships.indexOf(ship);
            this.fleet!.ships.splice(indexOf, 1);
        });
        this.loadFleet();
    }

    openRetireWarshipDialog(warShip: WarShip) {
        const dialogConfig = DialogConfigHelper.createDialog();
        dialogConfig.data = new DialogData("Retire " + warShip.name + '?');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.retireShip(warShip);
            }
        })
    }

    setWarshipName(warShip: WarShip, warshipName: string) {
        let sub = this.fleetService.renameWarship({id: warShip.idWarship, name: warshipName}).subscribe(resp => {
            if (resp) {
                this.snackbar.notifySave();
                setTimeout(() => {
                    this.fleet?.ships.filter(s => s.idWarship === warShip.idWarship).forEach(w => {
                        if (!!this.prefix) {
                            w.name = this.prefix + ' ' + warshipName;
                        } else {
                            w.name = warshipName;
                        }
                    });
                }, 100);
            }
        });
        this.subscriptions.push(sub);
    }

    getWarShipName(warShip: WarShip) {
        return !!this.prefix && warShip.name.startsWith(this.prefix) ? warShip.name.split(this.prefix + ' ')[1] : warShip.name;
    }
}
