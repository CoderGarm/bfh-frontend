import {Component, Inject, ViewChild} from "@angular/core";
import {ColonizationApiService, MiningFactors, Orbit, Planet, ResourcesApiService, StarSystem, StarSystemColonization} from "../../services/swagger";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {AppInjector} from "../../app.module";
import {SubscriptionManager} from "../../subscription.manager";

@Component({
    template: ''
})
export class ExpansionManager extends SubscriptionManager {

    displayedColumns: string[] = [];

    q1: boolean = true;
    q2: boolean = true;
    q3: boolean = true;
    q4: boolean = true;
    filterString: string = "";

    expandedElement?: StarSystemColonization | null;

    /**
     * ming factors by idPlanet
     */
    miningFactors: Map<Number, MiningFactors> = new Map<Number, MiningFactors>();

    knownSystems: StarSystem[] = [];
    homeSystem?: StarSystem;
    reference?: StarSystem;

    systemColonizations: StarSystemColonization[] = [];
    dataSource = new MatTableDataSource<StarSystemColonization>(this.systemColonizations);

    @ViewChild(MatPaginator) paginator?: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort?: MatSort;

    protected colonizationApi = AppInjector.get(ColonizationApiService);
    protected resourceApi = AppInjector.get(ResourcesApiService);

    pagedStarSystems: number[] = [];
    knownColoDurations: Map<number, number> = new Map<number, number>();
    askedColoDurations: Map<number, number> = new Map<number, number>();

    constructor(@Inject('columns') columns: string[]) {
        super();

        columns.forEach(c => this.displayedColumns.push(c));
    }

    getDistance(colonization: StarSystemColonization): number {
        if (!this.reference) {
            return NaN;
        }
        let distanceMapElement = colonization.distanceMap[this.reference.idStarSystem];
        return Math.round(distanceMapElement.coordinate);
    }

    getDuration(colonization: StarSystemColonization): number {
        if (!this.reference) {
            return NaN;
        }
        this.getSkip();
        const idStarSystem = colonization.starSystem.idStarSystem;

        const travelTime = this.knownColoDurations.has(idStarSystem) ? this.knownColoDurations.get(idStarSystem) : this.askedColoDurations.get(idStarSystem);
        if (!travelTime && this.pagedStarSystems.includes(idStarSystem)) {
            this.askedColoDurations.set(idStarSystem, 1);
            const indexOf = this.pagedStarSystems.indexOf(idStarSystem);
            this.pagedStarSystems.splice(indexOf, 1);
            this.colonizationApi.fetchColonizingTime(idStarSystem).subscribe(travelTime => {
                this.knownColoDurations.set(idStarSystem, travelTime);
            });
        }
        return !!travelTime ? travelTime : NaN;
    }


    getSkip() {
        const skip = this.paginator!.pageSize * this.paginator!.pageIndex;

        this.pagedStarSystems = this.dataSource.data.filter((u, i) => i >= skip)
            .filter((u, i) => i < this.paginator!.pageSize)
            .map(c => c.starSystem.idStarSystem);
    }

    initializePaginator() {
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

    fetchBaseData() {
        this.fetchKnownStarSystems();
        this.fetchHomeSystem();
    }

    private fetchKnownStarSystems() {
        let sub = this.colonizationApi.getKnownStarSystemsForUser()
            .subscribe(resp => this.knownSystems = resp);
        this.subscriptions.push(sub);
    }

    private fetchHomeSystem() {
        if (!!this.reference) {
            return;
        }
        let sub = this.colonizationApi.getHomeSystem()
            .subscribe(resp => {
                this.homeSystem = resp;
                this.reference = this.homeSystem;
                this.sortColonizations();
            });
        this.subscriptions.push(sub);
    }


    protected sortColonizations() {
        this.systemColonizations = this.systemColonizations.sort((a, b) => {
            if (!this.reference) {
                return 1;
            }
            const dA = this.getDistance(a);
            const dB = this.getDistance(b);

            return dA - dB;
        });
        this.dataSource.data = this.systemColonizations;
    }

    checkIfInsideQuadrantSelection(orbit: Orbit): boolean {
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

    applyFilter() {
        let filter = this.filterString.trim().toLowerCase();
        // the filter must be present to run the predicate
        filter += "-.-";
        this.dataSource.filter = filter;
        if (!!this.paginator && !!this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

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
}
