import {Component, Input, OnChanges, SimpleChanges, ViewChildren} from '@angular/core';
import {SubscriptionManager} from "../../../../../subscription.manager";
import {EnumValueDto, FleetApiService, PlanetAbstractId, WarShip} from "../../../../../services/swagger";
import {MatStepper} from "@angular/material/stepper";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfigHelper} from "../../../../../services/helper/dialog-config.helper";
import {DialogData} from "../../../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../../../components/confirmation-dialog/confirm-dialog.component";
import {ToggleNavService} from "../../../../../services/intercom/toggle-nav.service";
import {interval} from "rxjs";
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
    planet: PlanetAbstractId;
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
export class TransportResourcesComponent extends SubscriptionManager implements OnChanges {

    @Input()
    planets: PlanetAbstractId[] = [];

    mothballByPlanet: Map<number, WarShip[]> = new Map<number, WarShip[]>();

    carriageType: Items = Items.RESOURCES;

    @ViewChildren('stepper')
    private steppers?: MatStepper[];

    showStepper: boolean = true;
    dragDisabled: boolean = false;
    expandedPlanetId: number[] = [];

    planetsBySystem: Map<number, number[]> = new Map<number, number[]>();
    sortedPlanets: PlanetAbstractId[] = [];

    constructor(private fleetService: FleetApiService,
                public toggleNavService: ToggleNavService,
                private dialog: MatDialog) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!!changes['planets']) {
            this.planets.forEach(p => {
                const idStarSystem = p.idStarSystem;
                const idPlanet = p.idPlanet;
                let planets = this.planetsBySystem.get(idStarSystem);
                if (!planets) {
                    planets = [];
                }
                planets.push(idPlanet);
                this.planetsBySystem.set(idStarSystem, planets);
            });

            this.planetsBySystem.forEach((planetIDs, idStarSystem) => {
                const planets = this.planets.filter(p => planetIDs.includes(p.idPlanet));
                this.sortedPlanets.push(...planets);
            });
        }
    }

    private getMothball() {
        if (this.planets.length == 0) {
            this.mothballByPlanet.clear();
        }
        if (this.showStepper && this.carriageType != Items.SHIPS) {
            return;
        }
        const mothballByPlanet: Map<number, WarShip[]> = new Map<number, WarShip[]>();
        let finished: number = this.planets.length;
        this.planets.forEach(planet => {
            let sub = this.fleetService.getPooledWarships(planet.idPlanet)
                .subscribe(resp => {
                    resp.forEach(w => {
                        let idPlanet = planet.idPlanet;
                        if (!!w.transportJob) {
                            idPlanet = w.transportJob.to.id;
                        }
                        let arr = mothballByPlanet.get(idPlanet);
                        if (!arr) {
                            arr = [];
                        }
                        arr.push(w);
                        mothballByPlanet.set(idPlanet, arr);
                    });
                    finished--;
                });
            this.subscriptions.push(sub);
        });
        const source = interval(500);
        const sub = source.subscribe(() => {
            if (finished == 0) {
                this.planets.map(p => {
                    if (!mothballByPlanet.has(p.idPlanet)) {
                        mothballByPlanet.set(p.idPlanet, []);
                    }
                });
                this.mothballByPlanet = mothballByPlanet;
                sub.unsubscribe();
            }
        });
        this.subscriptions.push(sub);
        this.expandedPlanetId = [];
    }

    change(carriageType: Items) {

        this.carriageType = carriageType;
        if (this.carriageType === Items.RESOURCES) {
            this.showStepper = true;
            this.steppers?.forEach(a => a.selectedIndex = 0);
        } else if (this.carriageType === Items.PERSONNEL) {
            this.showStepper = true;
            this.steppers?.forEach(a => a.selectedIndex = 1);
        } else {
            this.showStepper = false;
            this.getMothball();
            return;
        }
    }

    drop(event: CdkDragDrop<WarShip[]>) {
        this.dragDisabled = true;
        const warShip = <WarShip>event.item.data;
        const idPlanet = Number.parseFloat(event.container.id);
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            this.dragDisabled = false;
            return;
        }

        let sub = this.fleetService.getTransferTime(warShip.idWarship, idPlanet).subscribe(resp => {
            const dialogConfig = DialogConfigHelper.createDialog();
            dialogConfig.data = new DialogData(
                'Transfer ' + warShip.name + '?',
                'This will take ' + resp + ' Ticks.');
            const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(result => {
                if (event.previousContainer === event.container) {
                    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
                    this.dragDisabled = false;
                }
                if (result) {
                    transferArrayItem(
                        event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex,
                    );
                    let sub = this.fleetService.transferPooledWarship(warShip.idWarship, idPlanet).subscribe(resp => {
                        warShip.transportJob = resp;
                        setTimeout(() => this.dragDisabled = false, 300);
                    });
                    this.subscriptions.push(sub);
                } else {
                    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
                    this.dragDisabled = false;
                }
            });
        });
        this.subscriptions.push(sub);
    }

    expandAll() {
        const allPlanets = this.sortedPlanets.map(p => p.idPlanet);
        for (let i = 0; i < allPlanets.length - 1; i++) {
            const number = allPlanets[i];
            if (!this.expandedPlanetId.includes(number)) {
                this.expandedPlanetId.push(number);
            }
        }
    }

    closeAll() {
        this.expandedPlanetId = [];
    }

    protected readonly Items = Items;
}
