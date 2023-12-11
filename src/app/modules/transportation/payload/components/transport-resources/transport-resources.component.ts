import {Component, Input, OnInit, ViewChildren} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {EnumValueDto, FleetApiService, Planet, PlanetApiService, ResourceDeposit, WarShip} from "../../../../../services/swagger";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {MatStepper} from "@angular/material/stepper";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfigHelper} from "../../../../../services/helper/dialog-config.helper";
import {DialogData} from "../../../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../../../components/confirmation-dialog/confirm-dialog.component";
import EDepositTypeEnum = EnumValueDto.EDepositTypeEnum;

export interface CarrierAmount {
    idPlanet: number;
    transportations: Amount[];
}

export interface Amount {
    resourceType: string;
    amount: number;
}

export interface ResourceFetchOrder {
    planet: Planet;
    type: EDepositTypeEnum;
}

enum Items {
    RESOURCES = 'Resources',
    PERSONNEL = 'Personnel',
    SHIPS = 'Ships'
}

@Component({
    selector: 'app-transport-resources',
    templateUrl: './transport-resources.component.html',
    styleUrls: ['./transport-resources.component.scss']
})
export class TransportResourcesComponent extends SubscriptionManager implements OnInit {

    @Input()
    planets: Planet[] = [];

    @Input()
    depositsResources: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    @Input()
    depositsPopulation: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    @Input()
    mothballByPlanet: Map<number, WarShip[]> = new Map<number, WarShip[]>();

    carriageTypes: string[] = ['Resources', 'Personnel', 'Ships'];
    carriageType: string = 'Resources';

    @ViewChildren('stepper')
    private steppers?: MatStepper[];

    showStepper: boolean = true;
    dragDisabled: boolean = false;

    constructor(private planetService: PlanetApiService,
                private fleetService: FleetApiService,
                private snackbar: SnackbarNotificationService,
                private dialog: MatDialog) {
        super();
    }

    ngOnInit(): void {
    }

    setDemand(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }

    setDelivery(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformResourceTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }

    private invalidEvent(event: CarrierAmount) {
        // don't know why, but a pointer event arrives on de-focusing the input
        return !('transportations' in event);
    }

    setHumanDemand(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDemand(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }

    setHumanDelivery(event: CarrierAmount) {
        if (this.invalidEvent(event)) {
            return;
        }
        let r: ResourceDeposit = ResourceHelper.transformHumanTransportationToDeposit(event);
        let sub = this.planetService.setTransportationDelivery(r, event.idPlanet).subscribe(() => this.snackbar.notifySave());
        this.subscriptions.push(sub);
    }

    change() {
        // a little more complex then necessary, but 2 factors: no setter for selectedIndex and to lazy for enum ordinal
        const index = this.steppers?.map(a => a.selectedIndex)[0]!;
        let diff: number;
        if (this.carriageType === Items.RESOURCES) {
            diff = 0 - index;
            this.showStepper = true;
        } else if (this.carriageType === Items.PERSONNEL) {
            diff = 1 - index;
            this.showStepper = true;
        } else {
            this.showStepper = false;
            return;
        }
        for (let i = 0; i < Math.abs(diff); i++) {
            if (diff < 0) {
                this.steppers?.forEach(a => a.previous());
            } else {
                this.steppers?.forEach(a => a.next());
            }
        }
    }

    drop(event: CdkDragDrop<WarShip[]>) {
        this.dragDisabled = true;
        const warShip = <WarShip>event.item.data;
        const idPlanet = Number.parseFloat(event.container.id);

        let sub = this.fleetService.getTransferTime(warShip.idWarship, idPlanet).subscribe(resp => {
            const dialogConfig = DialogConfigHelper.createDialog();
            dialogConfig.data = new DialogData(
                'Transfer ' + warShip.name + '?',
                'This will take ' + resp + ' Ticks.');
            const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    if (event.previousContainer === event.container) {
                        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
                    } else {
                        transferArrayItem(
                            event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex,
                        );
                    }
                    let sub = this.fleetService.transferPooledWarship(warShip.idWarship, idPlanet).subscribe(resp => {
                        warShip.transportJob = resp;
                        setTimeout(() => this.dragDisabled = false, 300);
                    });
                    this.subscriptions.push(sub);
                }
            });
        });
        this.subscriptions.push(sub);
    }
}
