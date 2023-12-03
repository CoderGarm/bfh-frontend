import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {Fleet, FleetApiService, MiningFactors, OrbitalStructures, Planet, PlanetApiService, ResourceDeposit, ResourcesApiService} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {PlanetsEventService} from "../../../planets-event.service";

@Component({
    selector: 'app-planet-tab-view',
    templateUrl: './planet-tab-view.component.html',
    styleUrls: ['./planet-tab-view.component.scss']
})
export class PlanetTabViewComponent extends SubscriptionManager implements AfterViewInit {

    static path: string = 'planets';

    selectedPlanet?: Planet;
    fleetsInOrbit?: Fleet[];
    orbitalStructures: OrbitalStructures[] = [];

    shipyardJobPossible: boolean = false;
    shipyardExists: boolean = false;

    sumOfPops: number = 0;
    resourceDeposit?: ResourceDeposit;
    income?: ResourceDeposit;
    capacity?: ResourceDeposit;
    utilization?: ResourceDeposit;
    miningFactors?: MiningFactors;

    index = 0;

    constructor(private planetApi: PlanetApiService,
                private planetsNotificationService: PlanetsEventService,
                private resourceService: ResourcesApiService,
                private fleetApi: FleetApiService,
                private change: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.planetsNotificationService.getSelectedPlanetEmitter().subscribe(selected => {
            this.selectedPlanet = selected;
            this.fetchData();
            this.fetchFleetsInOrbit();
        });
        this.subscriptions.push(sub);

        sub = this.planetsNotificationService.getConstructionStartsEmitter().subscribe(() => this.fetchResourceDeposit());
        this.subscriptions.push(sub);

        this.change.detectChanges();
    }

    private fetchFleetsInOrbit() {
        let sub = this.fleetApi.getFleetsByPlanet(this.selectedPlanet!.idPlanet).subscribe(resp => this.fleetsInOrbit = resp);
        this.subscriptions.push(sub);
        sub = this.fleetApi.getOrbitalStructuresByPlanet(this.selectedPlanet!.idPlanet).subscribe(resp => this.orbitalStructures = resp);
        this.subscriptions.push(sub);
    }

    fetchData() {
        const idPlanet = this.selectedPlanet!.idPlanet;
        let sub = this.planetApi.isShipyardJobPossibleOnPlanet(idPlanet)
            .subscribe(resp => this.shipyardJobPossible = resp);
        this.subscriptions.push(sub);

        sub = this.planetApi.isShipyardExistsOnPlanet(idPlanet)
            .subscribe(resp => {
                this.shipyardExists = resp;
                if (!this.shipyardExists && this.index === 2) {
                    // switch back to planetary dash when the new planet has no yard and you was on the old yard
                    this.index = 0;
                }
            });
        this.subscriptions.push(sub);

        this.fetchResourceDeposit();
        sub = this.resourceService.getResourceUtilization(idPlanet).subscribe(utilization => {
            this.utilization = utilization;
            utilization.humanResources.forEach(hr => this.sumOfPops += hr.amount);
        });
        this.subscriptions.push(sub);

        sub = this.resourceService.getPlanetaryIncome(idPlanet).subscribe(resp => this.income = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getPlanetaryCapacity(idPlanet).subscribe(resp => this.capacity = resp);
        this.subscriptions.push(sub);

        sub = this.resourceService.getMiningFactors(idPlanet).subscribe(resp => this.miningFactors = resp);
        this.subscriptions.push(sub);
    }

    private fetchResourceDeposit() {
        const idPlanet = this.selectedPlanet!.idPlanet;
        const sub = this.resourceService.getResourceDeposit(idPlanet)
            .subscribe(resp => {
                this.resourceDeposit = resp;
                resp.humanResources.forEach(hr => this.sumOfPops += hr.amount);
            });
        this.subscriptions.push(sub);
        return sub;
    }
}
