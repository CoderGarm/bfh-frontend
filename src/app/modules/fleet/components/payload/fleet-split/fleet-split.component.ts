import {AfterViewInit, Component, Input, SimpleChanges} from '@angular/core';
import {AbstractId, Fleet, FleetApiService, FleetSplit, WarShip} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";

interface FleetContainer {
    idFleet: number,
    name: string,
    ships: WarShip[]
}


@Component({
    selector: 'app-fleet-split',
    templateUrl: './fleet-split.component.html',
    styleUrls: ['./fleet-split.component.scss']
})
export class FleetSplitComponent extends SubscriptionManager implements AfterViewInit {

    @Input()
    fleet?: Fleet;

    fleets: FleetContainer[] = [];

    fleetSplit: FleetSplit = {fleetConstellations: {}};
    shipsForPool: number[] = [];

    pooledShips: WarShip[] = [];

    locked: number[] = [];

    runningInteger: number = -2;

    changeHappened: boolean = false;

    private static readonly POOL_FLEET_NAME: string = 'POOL';
    private static readonly POOL_FLEET_ID: number = -Number.MAX_VALUE;

    constructor(private fleetService: FleetApiService,
                private fleetCommService: FleetEventService,
                private notif: SnackbarNotificationService) {
        super();
    }

    ngAfterViewInit(): void {
        this.fetchPooledShips();
    }

    private fetchPooledShips() {
        let sub = this.fleetService.getPooledWarships().subscribe(resp => {
            this.pooledShips = resp
            this.fleets.filter(f => f.idFleet === FleetSplitComponent.POOL_FLEET_ID).forEach(f => f.ships = this.pooledShips.map(w => w));
            if (this.pooledShips.length > 0) {
                this.locked.push(FleetSplitComponent.POOL_FLEET_ID)
            }
        });
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fleet'] && !!this.fleet) {
            this.setupFleet(this.fleet);
        }
    }

    private setupFleet(fleet: Fleet) {
        this.fleets = [];
        this.createPoolFleet();

        this.locked.push(fleet.idFleet);
        this.fleets.push({
            idFleet: fleet.idFleet,
            name: fleet.name,
            ships: fleet.ships
        });
        this.addFleetContainer();
    }

    private createPoolFleet() {
        this.fleets.push({
            idFleet: FleetSplitComponent.POOL_FLEET_ID,
            name: FleetSplitComponent.POOL_FLEET_NAME,
            ships: this.pooledShips.map(w => w)
        });
    }

    private isPooledShip(w: WarShip) {
        return this.pooledShips.filter(p => p.idWarship === w.idWarship).length > 0;
    }

    drop(event: CdkDragDrop<WarShip[]>, isLocked: boolean) {
        if (isLocked) {
            return;
        }
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
        this.changeHappened = true;
    }

    addFleetContainer() {
        this.runningInteger--;
        this.fleets.push({
            idFleet: this.runningInteger,
            name: '',
            ships: []
        })
    }

    removeFleetContainer() {
        const length = this.fleets.length;
        this.fleets.splice(length - 1, 1)
    }

    submit() {
        this.fleetSplit = {fleetConstellations: {}};
        this.shipsForPool = [];
        this.fleets.forEach(fleet => {
            if (fleet.idFleet === FleetSplitComponent.POOL_FLEET_ID) {
                this.shipsForPool = fleet.ships.filter(s => !this.isPooledShip(s)).map(s => s.idWarship);
            } else {
                if (fleet.idFleet < 0 && fleet.ships.length > 0) {
                    this.fleetSplit.fleetConstellations[fleet.name + fleet.idFleet] = fleet.ships.map(s => s.idWarship);
                }
            }
        });

        if (this.shipsForPool.length > 0) {
            let sub = this.fleetService.sendWarshipsToPool(this.shipsForPool).subscribe(() => {
                this.notif.open('Ships send to reserve');
                this.fetchPooledShips();
            });
            this.subscriptions.push(sub);
        }

        if (Object.keys(this.fleetSplit.fleetConstellations).length > 0) {
            let sub = this.fleetService.splitFleets(this.fleetSplit).subscribe(resp => {
                let separatedFleets: AbstractId[] = resp.map(f => <AbstractId>{
                    id: f.idFleet,
                    name: f.name
                });
                separatedFleets.forEach(sf => this.fleetCommService.changeName({
                    idFleet: sf.id,
                    name: sf.name!
                }));
                this.notif.open('Fleets detached');
                this.reFetchFleet();
            });
            this.subscriptions.push(sub);
        }
    }

    reFetchFleet() {
        if (!!this.fleet) {
            let sub = this.fleetService.getFleet(this.fleet.idFleet).subscribe(resp => this.setupFleet(resp));
            this.subscriptions.push(sub);
        }
    }

    allValid() {
        if (!this.changeHappened) {
            return false;
        }
        const detachmentsWithShips = this.fleets.filter(f => f.ships.length > 0).length;
        const length = this.shipsForPool.length;
        const checksumFuturePool = this.shipsForPool.reduce((sum, current) => sum + current, 0);
        const checksumPool = this.pooledShips.map(w => w.idWarship).reduce((sum, current) => sum + current, 0);
        const noNamePresent = this.fleets.filter(f => this.locked.includes(f.idFleet)).filter(f => f.name.trim().length == 0).length > 0;
        return !noNamePresent && (detachmentsWithShips > 1 || checksumPool != checksumFuturePool || length > 0) && this.locked.length == detachmentsWithShips;
    }
}
