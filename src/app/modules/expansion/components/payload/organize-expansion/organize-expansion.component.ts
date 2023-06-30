import {AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {EEducationType, EResourceType, Orbit, Planet, PlanetApiService, ResourceDeposit, StarSystem, StarSystemColonization} from "../../../../../services/swagger";
import {MatCheckbox} from "@angular/material/checkbox";
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {SpinnerService} from "../../../../../services/spinner.service";
import {TranslateService} from "@ngx-translate/core";
import {TypeService} from "../../../../../services/type.service";
import {BackgroundService} from "../../../../../services/prefetch/background.service";
import {ExpansionManager} from "../../../expansion.manager";

@Component({
    selector: 'app-organize-expansion',
    templateUrl: './organize-expansion.component.html',
    styleUrls: ['./organize-expansion.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])]
})
export class OrganizeExpansionComponent extends ExpansionManager implements AfterViewInit, AfterContentInit {

    @ViewChild("onlyKnownSystems", {static: false})
    onlyKnownCheckBox?: MatCheckbox;

    private static COLUMNS: string[] = ['Star system', 'Orbit', 'Distance'];

    private readonly resourceTypes?: EResourceType[];
    private readonly educationTypes?: EEducationType[];

    private main?: Planet;
    resourceDeposit?: ResourceDeposit;
    costs?: ResourceDeposit;

    showOnlyKnownStarSystems: boolean = false;

    constructor(private planetApi: PlanetApiService,
                private typeService: TypeService,
                private spinnerService: SpinnerService,
                private backgroundService: BackgroundService,
                private change: ChangeDetectorRef,
                public translate: TranslateService) {
        super(OrganizeExpansionComponent.COLUMNS);
        this.defineFilterPredicate();

        // just make sure that the key exists
        this.translate.get('expansion.organize.spinner-message.wait');

        this.educationTypes = typeService.educationTypes;
        this.resourceTypes = typeService.eResourceTypes;
    }

    ngAfterViewInit() {
        this.starSystems = [];
        this.fetchData();
        this.initializePaginator();
    }


    ngAfterContentInit(): void {
        if (!!this.resourceTypes && !!this.educationTypes) {
            this.costs = ResourceHelper.getBlankCosts(this.resourceTypes, this.educationTypes);
        }
    }

    private fetchData() {
        this.spinnerService.activateSpinner('expansion.organize.spinner-message.wait');
        this.fetchBaseData();
        let sub = this.backgroundService.getColonizationStarSystemsForUser()
            .subscribe(resp => {
                this.starSystems = resp;
                this.dataSource.data = this.starSystems;
                this.sortColonizations();
                this.spinnerService.deactivateSpinner();
            });
        this.subscriptions.push(sub);
        this.fetchMainPlanetsDeposit();
    }

    private fetchMainPlanetsDeposit() {
        if (!!this.main) {
            this.fetchDeposit(this.main);
        } else {
            let sub = this.planetApi.getMainPlanet().subscribe(resp => {
                this.main = resp;
                this.fetchDeposit(resp);
            });
            this.subscriptions.push(sub);
        }
    }

    private fetchDeposit(planet: Planet) {
        let sub = this.resourceApi.getResourceDeposit(planet.idPlanet)
            .subscribe(resp => {
                this.resourceDeposit = resp
            });
        this.subscriptions.push(sub);
    }

    private defineFilterPredicate() {
        this.dataSource.filterPredicate = (data: StarSystemColonization, filter: string) => {

            let filterString = filter.split("-.-")[0];
            let orbit = data.starSystem.orbit;
            let isInsideSelection = this.checkIfInsideQuadrantSelection(orbit);

            let knownMatches = true;
            if (this.showOnlyKnownStarSystems) {
                let known = this.checkIfKnown(data.starSystem);
                if (!known) {
                    knownMatches = false;
                }
            }
            let nameMatching = OrganizeExpansionComponent.checkIfStarSystemNameIsValid(data, filterString);
            return nameMatching && isInsideSelection && knownMatches;
        };
    }

    checkIfKnown(system: StarSystem): boolean {
        let systems = this.knownSystems.filter(sys => sys.idStarSystem == system.idStarSystem);
        return systems.length != 0;

    }

    applyOnlyKnownFilter(checked: boolean) {
        this.showOnlyKnownStarSystems = checked;
        this.applyFilter();
    }

    /**
     * checks iof the name of the star system is part of the filter
     * @param data
     * @param filterByName
     * @private
     */
    static checkIfStarSystemNameIsValid(data: StarSystemColonization, filterByName: string) {
        let name = data.starSystem.name;
        if (name.toLowerCase().includes(filterByName.toLowerCase())) return true;
        else if (!!name && name.length > 0 && name.toLowerCase().includes(filterByName.toLowerCase())) return true;
        return false;
    }

    getOrbitString(orbit: Orbit): string {
        return "X-Coordinate: " + orbit.xCoordinate.coordinate + " Y-Coordinate: " + orbit.yCoordinate.coordinate;
    }

    buySystemsInformation(colo: StarSystemColonization) {
        let sub = this.colonizationApi.buyInformationForSystem(colo.starSystem).subscribe(resp => {
            const item = this.dataSource.data.filter(value => value.starSystem.idStarSystem === resp.starSystem.idStarSystem)[0];
            const index = this.dataSource.data.indexOf(item);
            if (index !== -1) {
                this.dataSource.data[index].distanceMap = resp.distanceMap;
                this.dataSource.data[index].costsToBuyColonizationInformation = resp.costsToBuyColonizationInformation;
                this.dataSource.data[index].costsToColonization = resp.costsToColonization;
                this.dataSource.data[index].colonizationsByPlanet = resp.colonizationsByPlanet;
                this.knownSystems.push(resp.starSystem);
            }
        });
        this.subscriptions.push(sub);
    }

    getCostsToColonize(colo: StarSystemColonization, planet: Planet) {
        return colo.costsToColonization[planet.idPlanet];
    }

    addToCosts(checked: boolean, colo: StarSystemColonization, planet: Planet) {
        if (!this.costs) {
            return;
        }
        const costs = this.getCostsToColonize(colo, planet);
        if (checked) {
            // add costs
            this.costs = ResourceHelper.addToBill(costs, this.costs);
        } else {
            // remove costs
            this.costs = ResourceHelper.reduceTheBill(costs, this.costs);
        }
    }

    colonizePlanet(planet: Planet) {
        this.spinnerService.activateSpinner('expansion.organize.spinner-message.wait');
        let sub = this.colonizationApi.startColonizingPlanet(planet).subscribe(resp => {
            this.spinnerService.deactivateSpinner();
            this.fetchData();
        });
        this.subscriptions.push(sub);
    }

    checkIfColonizationIsInProgress(colo: StarSystemColonization, planet: Planet) {
        const colonization = colo.colonizationsByPlanet[planet.idPlanet];
        return !!colonization && !colonization.isPlanned;
    }

    checkIfColonizationIsPlanned(colo: StarSystemColonization, planet: Planet) {
        const colonization = colo.colonizationsByPlanet[planet.idPlanet];
        return !!colonization && colonization.isPlanned;
    }

    checkIfPlanetIsAlreadyColonized(planet: Planet) {
        return !!planet.owner;
    }

    getTicksLeft(colo: StarSystemColonization, planet: Planet) {
        let colonization = colo.colonizationsByPlanet[planet.idPlanet];
        if (!!colonization) {
            return colonization.doneAtZero;
        }
        return NaN;
    }

    changeReferenceSystem(idStarSystem: number) {
        this.reference = this.knownSystems.filter(sys => sys.idStarSystem === idStarSystem)[0];
        this.change.detectChanges()
    }
}
