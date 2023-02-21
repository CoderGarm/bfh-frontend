import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {Orbit, Planet, StarSystemColonization} from "../../../../../services/swagger";
import {OrganizeExpansionComponent} from "../organize-expansion/organize-expansion.component";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ExpansionManager} from "../../../expansion.manager";

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
export class SeeExpansionComponent extends ExpansionManager implements AfterViewInit {

    private static COLUMNS: string[] = ['Star system', 'Orbit', 'Distance'];

    constructor(private change: ChangeDetectorRef) {
        super(SeeExpansionComponent.COLUMNS);

        this.defineFilterPredicate();
    }

    ngAfterViewInit(): void {
        this.starSystems = [];
        this.fetchData();
        this.initializePaginator();
    }

    private fetchData() {
        this.fetchBaseData();
        let sub = this.colonizationApi.getPendingColonizationsForUser()
            .subscribe(resp => {
                this.starSystems = this.starSystems.concat(resp);
                this.dataSource.data = this.starSystems;
            });
        this.subscriptions.push(sub);
    }

    private defineFilterPredicate() {
        this.dataSource.filterPredicate = (data: StarSystemColonization, filter: string) => {

            let filterString = filter.split("-.-")[0];
            let orbit = data.starSystem.orbit;
            let isInsideSelection = this.checkIfInsideQuadrantSelection(orbit);

            let nameMatching = OrganizeExpansionComponent.checkIfStarSystemNameIsValid(data, filterString);
            return nameMatching && isInsideSelection;
        };
    }

    getOrbitString(orbit: Orbit): string {
        return "X-Coordinate: " + orbit.xCoordinate.coordinate + " Y-Coordinate: " + orbit.yCoordinate.coordinate;
    }

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
