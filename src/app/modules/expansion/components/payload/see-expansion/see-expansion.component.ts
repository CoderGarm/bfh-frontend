import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {ColonizationApiService} from "../../../../../services/swagger/api/colonizationApi.service";
import {ResourcesApiService} from "../../../../../services/swagger/api/resourcesApi.service";
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {MiningFactors, Orbit, Planet, StarSystem, StarSystemColonization} from "../../../../../services/swagger";
import {MatTableDataSource} from "@angular/material/table";
import {OrganizeExpansionComponent} from "../organize-expansion/organize-expansion.component";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
    selector: 'app-see-expansion',
    templateUrl: './see-expansion.component.html',
    styleUrls: ['./see-expansion.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])]
})
export class SeeExpansionComponent extends SubscriptionManager implements AfterViewInit {

    displayedColumns: string[] = ['Star system', 'Orbit', 'Distance'];

    knownSystems: StarSystem[] = [];
    starSystems: StarSystemColonization[] = [];
    dataSource = new MatTableDataSource<StarSystemColonization>(this.starSystems);

    expandedElement?: StarSystemColonization | null;

    q1: boolean = true;
    q2: boolean = true;
    q3: boolean = true;
    q4: boolean = true;
    filterString: string = "";
    private homeSystem?: StarSystem;
    reference?: StarSystem;

    /**
     * ming factors by idPlanet
     */
    miningFactors: Map<Number, MiningFactors> = new Map<Number, MiningFactors>();

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort?: MatSort;

    constructor(private tokenStorage: TokenStorage,
                private colonizationApi: ColonizationApiService,
                private resourceApi: ResourcesApiService) {
        super();
        this.defineFilterPredicate();
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
    }

    /**
     * fetches all necessary data to fill the table
     * @private
     */
    private fetchData() {
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
            sub = this.colonizationApi.getPendingColonizationsForUser(userID)
                .subscribe(resp => {
                    this.starSystems = this.starSystems.concat(resp);
                    this.dataSource.data = this.starSystems;
                });
            this.subscriptions.push(sub);
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

            let nameMatching = OrganizeExpansionComponent.checkIfStarSystemNameIsValid(data, filterString);
            return nameMatching && isInsideSelection;
        };
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
     * returns the input as a boolean
     * @param value
     */
    getBoolean(value: any) {
        switch (value) {
            case true:
            case "true":
            case 1:
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
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
     * checks if a colonization is in progress for the planet
     * @param colo
     * @param planet
     */
    checkIfColonizationIsInProgress(colo: StarSystemColonization, planet: Planet) {
        return !!colo.colonizationsByPlanet[planet.idPlanet];
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
     * returns the planets which were currently colonized
     * @param colo
     */
    getPendingColonizations(colo: StarSystemColonization) {
        let planets: Planet[] = [];
        colo.starSystem.planets.forEach(p => {
            let colonization = colo.colonizationsByPlanet[p.idPlanet];
            if (!!colonization) {
                planets.push(colonization.target);
            }
        });
        return planets;
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
