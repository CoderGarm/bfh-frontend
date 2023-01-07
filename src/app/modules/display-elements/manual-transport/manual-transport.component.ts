import {AfterViewInit, Component, Inject, Input, OnChanges, Optional, SimpleChanges} from '@angular/core';
import {
    EEducationType,
    EResourceType,
    Fleet,
    HumanResourceAmount,
    Planet,
    PlanetApiService,
    ResourceAmount,
    ResourceDeposit,
    ResourcesApiService,
    ResourceTransfer
} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {TypeService} from "../../../services/type.service";
import {ResourceHelper} from "../../../ResourceHelper";
import TransportTypeEnum = ResourceTransfer.TransportTypeEnum;


@Component({
    selector: 'app-manual-transport',
    templateUrl: './manual-transport.component.html',
    styleUrls: ['./manual-transport.component.scss']
})
export class ManualTransportComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * A single capacity unit of a spacecraft multiplied by this is the amount of resources or human the capacity represents.<br>
     * In short:<br>
     * 1 capacity are 1000 humans or resources or a mix of them.<br>
     * <br>
     * Seems to be a bit too much for a guy who isn't from <code>San Martin</code> but as you can't transport frozen people, just take it as the person with life-saving equipment.
     */
    static CAPACITY_TO_RESOURCE_UNIT_CONVERSION_FACTOR = 1000;

    @Input()
    floatingStyle: boolean = true;

    @Input()
    fleet?: Fleet;

    left?: ResourceDeposit;
    leftCopy?: ResourceDeposit;

    @Input()
    planet?: Planet;

    right?: ResourceDeposit;
    rightCopy?: ResourceDeposit;

    resourceTypes: EResourceType[];
    educationTypes: EEducationType[];

    initialFreeCapacity: number = 0;
    usedCapacity: number = 0;
    freeCapacity: number = 0;

    result: ResourceTransfer[] = [];

    constructor(@Optional() @Inject('fleet') fleet: Fleet | undefined,
                private typeService: TypeService,
                private resourceService: ResourcesApiService,
                private planetService: PlanetApiService) {
        super();

        this.fleet = fleet;
        if (!!fleet) {
            this.fetchFleet();
        }
        this.resourceTypes = this.typeService.collectableResourceTypes;
        this.educationTypes = this.typeService.militaryEducationTypes;
    }

    isOwnFleet() {
        return !this.fleet || this.fleet.owner.idUser == this.userId;
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.isOwnFleet()) {
            if (changes['planet']) {
                this.fetchPlanet();
            }

            if (changes['fleet']) {
                this.fetchFleet();
            }
        }
    }

    private fetchFleet() {
        if (!!this.fleet) {
            let sub = this.resourceService.getResourceDepositForFleet(this.fleet.idFleet).subscribe(resp => {
                this.left = resp;
                this.leftCopy = ResourceHelper.copy(this.left);
                this.initialFreeCapacity = this.fleet!.spacecraftCapacityAreas.capacityValues
                        .reduce((sum, current) => sum + current.capacity - current.usedCapacity, 0)
                    * ManualTransportComponent.CAPACITY_TO_RESOURCE_UNIT_CONVERSION_FACTOR;

                this.freeCapacity = this.initialFreeCapacity;

                let used = this.getSum(this.left.resources) + this.getSum(this.left.humanResources);
                this.freeCapacity -= used;
                this.usedCapacity += used;
            });
            this.subscriptions.push(sub);
        }
        this.fetchPlanetByFleet();
    }

    private fetchPlanet() {
        if (!!this.planet && !this.right) {
            let sub = this.resourceService.getResourceDeposit(this.planet.idPlanet).subscribe(resp => {
                this.right = resp;
                this.rightCopy = ResourceHelper.copy(this.right);
            });
            this.subscriptions.push(sub);
        }
    }

    private fetchPlanetByFleet() {
        if (!this.fleet) {
            this.planet = undefined;
            return;
        }
        const orbit = this.fleet.orbit;
        if (!orbit || !orbit.orbit || !orbit.system) {
            this.planet = undefined;
            return;
        }
        let sub = this.planetService.getPlanetByCoordinates(orbit.orbit!, orbit.system!.idStarSystem)
            .subscribe(resp => {
                this.planet = resp;
                this.fetchPlanet();
            });
        this.subscriptions.push(sub);
    }

    private getSum(array: any[]): number {
        return array.reduce((sum: number, current: ResourceAmount | HumanResourceAmount) => sum + current.amount, 0);
    }

    getLink(resourceType: EResourceType | EEducationType): string {
        let folder = resourceType.folder;
        let iconName = resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    setAmount(amount: number, resource: EResourceType | EEducationType) {

        const toFleet: boolean = amount < 0;
        const from: ResourceDeposit | undefined = toFleet ? this.right : this.left;
        const to: ResourceDeposit | undefined = toFleet ? this.left : this.right;

        if (toFleet && this.freeCapacity < Math.abs(amount)) {
            amount = -this.freeCapacity;
        }

        this.freeCapacity += amount;
        this.usedCapacity -= amount;

        from?.resources.filter(r => this.matches(r, resource)).forEach(r => r.amount += amount);
        to?.resources.filter(r => this.matches(r, resource)).forEach(r => r.amount += amount);
        from?.humanResources.filter(r => this.matches(r, resource)).forEach(r => r.amount += amount);
        to?.humanResources.filter(r => this.matches(r, resource)).forEach(r => r.amount += amount);

        const transferElement: ResourceTransfer = this.getOrCreate(toFleet);
        transferElement.resources.filter(r => this.matches(r, resource)).forEach(r => r.amount += Math.abs(amount));
        transferElement.humanResources.filter(r => this.matches(r, resource)).forEach(r => r.amount += Math.abs(amount));
    }

    private getOrCreate(transferToFleet: boolean) {
        const e: TransportTypeEnum = transferToFleet ? ResourceTransfer.TransportTypeEnum.PLANETTOFLEET : ResourceTransfer.TransportTypeEnum.FLEETTOPLANET;
        const match = this.result.filter(r => r.transportType === e);
        if (match.length == 0) {
            const item = {
                transportType: e,
                fromId: transferToFleet ? this.planet?.idPlanet! : this.fleet?.idFleet!,
                toId: transferToFleet ? this.fleet?.idFleet! : this.planet?.idPlanet!,
                humanResources: this.educationTypes.map(type => {
                    return {
                        resourceType: type,
                        amount: 0
                    };
                }),
                resources: this.resourceTypes.map(type => {
                    return {
                        resourceType: type,
                        amount: 0
                    };
                })
            };
            this.result.push(item);
            return item;
        }
        return match[0];
    }

    private matches(r: ResourceAmount | HumanResourceAmount, resource: EResourceType | EEducationType) {
        return r.resourceType.typeName === resource.typeName;
    }

    transfer() {
        const sub = this.resourceService.transferResources(this.result).subscribe(resp => {
            this.fetchPlanet();
            this.fetchFleet();
            this.result = [];
        });
        this.subscriptions.push(sub);
    }

    transferSelected() {
        return this.result.length > 0 && this.result.filter(r => this.containsData(r)).length > 0;
    }

    private containsData(r: ResourceTransfer) {
        return r.resources.filter(a => a.amount > 0).length > 0 || r.humanResources.filter(a => a.amount > 0).length > 0;
    }
}