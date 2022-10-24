import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {
    ColonizationApiService,
    EEducationType,
    EResourceType,
    MiningFactors,
    Orbit,
    Planet,
    PlanetApiService,
    ResourceDeposit,
    ResourcesApiService,
    StarSystem,
    StarSystemColonization
} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ResourceHelper} from "../../../../../ResourceHelper";
import {SpinnerService} from "../../../../../services/spinner.service";
import {TranslateService} from "@ngx-translate/core";
import {TypeService} from "../../../../../services/type.service";

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
export class OrganizeExpansionComponent extends SubscriptionManager implements AfterViewInit {

    @ViewChild("onlyKnownSystems", {static: false})
    onlyKnownCheckBox?: MatCheckbox;

    expandedElement?: StarSystemColonization | null;

    displayedColumns: string[] = ['Star system', 'Orbit', 'Distance'];

    starSystems: StarSystemColonization[] = [];
    dataSource = new MatTableDataSource<StarSystemColonization>(this.starSystems);
    knownSystems: StarSystem[] = [];
    private homeSystem?: StarSystem;
    reference?: StarSystem;

    /**
     * ming factors by idPlanet
     */
    miningFactors: Map<Number, MiningFactors> = new Map<Number, MiningFactors>();

    private readonly resourceTypes?: EResourceType[];
    private readonly educationTypes?: EEducationType[];

    private main?: Planet;
    resourceDeposit?: ResourceDeposit;
    costs?: ResourceDeposit;

    showOnlyKnownStarSystems: boolean = false;

    q1: boolean = true;
    q2: boolean = true;
    q3: boolean = true;
    q4: boolean = true;
    filterString: string = "";

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort?: MatSort;

    constructor(private tokenStorage: TokenStorage,
                private colonizationApi: ColonizationApiService,
                private resourceApi: ResourcesApiService,
                private planetApi: PlanetApiService,
                private typeService: TypeService,
                private spinnerService: SpinnerService,
                public translate: TranslateService) {
        super();
        this.defineFilterPredicate();

        // just make sure that the key exists
        this.translate.get('expansion.organize.spinner-message.wait');

        this.educationTypes = typeService.educationTypes;
        this.resourceTypes = typeService.eResourceTypes;
    }

    ngAfterViewInit(): void {
        this.starSystems = [];
        this.fetchData();
        if (!!this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
        if (!!this.sort) {
            this.dataSource.sort = this.sort;
            this.dataSource.sortingDataAccessor = (item, property) => {
                switch (property) {
                    case this.displayedColumns[0]:
                        return item.starSystem.name;
                    case this.displayedColumns[2]:
                        return this.getDistance(item);
                    default:
                        return '';
                }
            };
        }
        let sub = this.planetApi.getMainPlanet().subscribe(resp => {
            this.main = resp;
            sub = this.resourceApi.getResourceDeposit(this.main.idPlanet)
                .subscribe(resp => this.resourceDeposit = resp);
            this.subscriptions.push(sub);
        });
        this.subscriptions.push(sub);

        if (!!this.resourceTypes && !!this.educationTypes) {
            this.costs = ResourceHelper.getBlankCosts(this.resourceTypes, this.educationTypes);
        }
    }

    /**
     * fetches all necessary data to fill the table
     * @private
     */
    private fetchData() {
        this.spinnerService.activateSpinner('expansion.organize.spinner-message.wait');
        let userID = this.tokenStorage.getUserID();
        if (!!userID) {
            let sub = this.colonizationApi.getKnownStarSystemsForUser(userID)
                .subscribe(resp => this.knownSystems = resp);
            this.subscriptions.push(sub);
            sub = this.colonizationApi.getHomeSystem(userID)
                .subscribe(resp => {
                    this.homeSystem = resp;
                    this.reference = this.homeSystem;
                    // todo reference not pre-selected in mat-select
                });
            this.subscriptions.push(sub);
            sub = this.colonizationApi.getColonizationStarSystemsForUser(userID)
                .subscribe(resp => {
                    this.starSystems = this.starSystems.concat(resp);
                    this.dataSource.data = this.starSystems;
                    this.spinnerService.deactivateSpinner();
                });
            this.subscriptions.push(sub);
        }
    }

    /**
     * just apply the current filter value
     */
    applyFilter() {
        let filter = this.filterString.trim().toLowerCase();
        // the filter must be present to run the predicate
        filter += "-.-";
        this.dataSource.filter = filter;
        if (!!this.paginator && !!this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    /**
     * define all filter behaviors
     * @private
     */
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

    /**
     * checks if a star system is already known
     * @param system
     */
    checkIfKnown(system: StarSystem): boolean {
        let systems = this.knownSystems.filter(sys => sys.idStarSystem == system.idStarSystem);
        return systems.length != 0;

    }

    /**
     * sets the new state of the checkbox and applies the filter
     * @param checked
     */
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

    /**
     * checks if the given orbit is inside the quadrant selection
     * @param orbit
     * @private
     */
    private checkIfInsideQuadrantSelection(orbit: Orbit): boolean {
        let result = false;

        let x = orbit.xCoordinate.coordinate;
        let y = orbit.yCoordinate.coordinate;
        const signX = x >= 0 ? 1 : -1;
        const signY = y >= 0 ? 1 : -1;
        if (this.q1 && (signX > 0 && signY > 0)) {
            result = true;
        }
        if (this.q2 && (signX > 0 && signY < 0)) {
            result = true;
        }
        if (this.q3 && (signX < 0 && signY < 0)) {
            result = true;
        }
        if (this.q4 && (signX < 0 && signY > 0)) {
            result = true;
        }
        return result;
    }

    /**
     * returns the orbit's string representation
     * @param orbit
     */
    getOrbitString(orbit: Orbit): string {
        return "X-Coordinate: " + orbit.xCoordinate.coordinate + " Y-Coordinate: " + orbit.yCoordinate.coordinate;
    }

    /**
     * returns the distance to the current selected 'center' or, if not present, the home system
     * @param colonization
     */
    getDistance(colonization: StarSystemColonization): number {
        if (!this.reference) {
            return NaN;
        }
        let distanceMapElement = colonization.distanceMap[this.reference.idStarSystem];
        return Math.round(distanceMapElement.coordinate);
    }

    /**
     * changes the selection and runs the filter
     * @param event
     */
    changeAndFilter(event: MatCheckboxChange) {
        let id: string = event.source.id;
        let checked: boolean = event.checked;
        if (id === 'q1') {
            this.q1 = checked;
        }
        if (id === 'q2') {
            this.q2 = checked;
        }
        if (id === 'q3') {
            this.q3 = checked;
        }
        if (id === 'q4') {
            this.q4 = checked;
        }
        this.applyFilter();
    }

    /**
     * buys the system information in order to colonize planets
     * @param colo
     */
    buySystemsInformation(colo: StarSystemColonization) {
        let sub = this.colonizationApi.buyInformationForSystem(colo.starSystem, this.tokenStorage.getUserID()).subscribe(resp => {
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

    /**
     * returns the costs of a colonization as string
     * @param colo
     * @param planet
     */
    getCostsToColonize(colo: StarSystemColonization, planet: Planet) {
        return colo.costsToColonization[planet.idPlanet];
    }

    isPayPossible(colo: StarSystemColonization, planet: Planet) {
        if (!this.costs || !this.resourceDeposit) {
            return false;
        }
        const costs = this.getCostsToColonize(colo, planet);
        return ResourceHelper.canPayTheBill(costs, this.resourceDeposit);
    }

    addToCosts(checked: boolean, colo: StarSystemColonization, planet: Planet) {
        if (!this.costs) {
            return;
        }
        const costs = this.getCostsToColonize(colo, planet);
        if (checked) {
            // add costs
            ResourceHelper.addToBill(costs, this.costs);
        } else {
            // remove costs
            ResourceHelper.reduceTheBill(costs, this.costs);
        }
    }

    /**
     * starts colonizing the planet
     * @param planet
     */
    colonizePlanet(planet: Planet) {
        let userID = this.tokenStorage.getUserID();
        if (!!userID) {
            let sub = this.colonizationApi.startColonizingPlanet(planet, userID).subscribe(resp => {
                this.fetchData();
            });
            this.subscriptions.push(sub);
        }
    }

    /**
     * checks if a colonization is in progress for the planet
     * @param colo
     * @param planet
     */
    checkIfColonizationIsInProgress(colo: StarSystemColonization, planet: Planet) {
        return !!colo.colonizationsByPlanet[planet.idPlanet];
    }

    /**
     * checks if the planet is already colonized
     * @param planet
     */
    checkIfPlanetIsAlreadyColonized(planet: Planet) {
        return !!planet.owner;
    }

    /**
     * fetches the mining factors if needed
     * @param colo
     * @param planet
     */
    getMiningFactors(colo: StarSystemColonization, planet: Planet): MiningFactors | undefined {
        if (colo.starSystem.idStarSystem != this.expandedElement?.starSystem.idStarSystem) {
            return undefined;
        }

        let knownFactors = this.miningFactors.get(planet.idPlanet);
        if (!!knownFactors) {
            return knownFactors;
        }
        let sub = this.resourceApi.getMiningFactors(planet.idPlanet).subscribe(resp => {
            knownFactors = resp;
            this.miningFactors.set(planet.idPlanet, knownFactors);
        });
        this.subscriptions.push(sub);
        return knownFactors;
    }

    /**
     * returns how many ticks are left to colonize the planet successfully
     * @param colo
     * @param planet
     */
    getTicksLeft(colo: StarSystemColonization, planet: Planet) {
        let colonization = colo.colonizationsByPlanet[planet.idPlanet];
        if (!!colonization) {
            return colonization.doneAtZero;
        }
        return NaN;
    }
}
