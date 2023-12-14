import {AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {Colonization, EEducationType, EResourceType, Orbit, Planet, PlanetApiService, ResourceDeposit, StarSystem, StarSystemColonization} from "../../../../../services/swagger";
import {MatCheckbox} from "@angular/material/checkbox";
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {SpinnerService} from "../../../../../services/spinner.service";
import {TranslateService} from "@ngx-translate/core";
import {TypeService} from "../../../../../services/type.service";
import {BackgroundService} from "../../../../../services/prefetch/background.service";
import {ExpansionManager} from "../../../expansion.manager";
import {DialogConfigHelper} from "../../../../../services/helper/dialog-config.helper";
import {DialogData} from "../../../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../../../components/confirmation-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

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

    private static COLUMNS: string[] = ['Star system', 'Orbit', 'Distance', 'Duration'];

    private resourceTypes?: EResourceType[];
    private educationTypes?: EEducationType[];

    private main?: Planet;
    resourceDeposit?: ResourceDeposit;
    costs?: ResourceDeposit;

    showOnlyKnownStarSystems: boolean = false;

    constructor(private planetApi: PlanetApiService,
                private typeService: TypeService,
                private spinnerService: SpinnerService,
                private backgroundService: BackgroundService,
                private change: ChangeDetectorRef,
                public translate: TranslateService,
                private dialog: MatDialog) {
        super(OrganizeExpansionComponent.COLUMNS);
        this.defineFilterPredicate();

        // just make sure that the key exists
        this.translate.get('expansion.organize.spinner-message.wait');

        let sub = this.typeService.educationTypes.subscribe(d => this.educationTypes = d);
        this.subscriptions.push(sub);

        sub = this.typeService.eResourceTypes.subscribe(d => this.resourceTypes = d);
        this.subscriptions.push(sub);
    }

    ngAfterViewInit() {
        this.systemColonizations = [];
        this.fetchData();
        this.initializePaginator();
    }


    ngAfterContentInit(): void {
        if (!!this.resourceTypes && !!this.educationTypes) {
            this.costs = ResourceHelper.getBlankCosts(this.resourceTypes, this.educationTypes);
        }
    }

    private fetchData(colo?: Colonization) {
        this.spinnerService.activateSpinner('expansion.organize.spinner-message.wait');
        this.fetchBaseData();
        let sub = this.backgroundService.getColonizationStarSystemsForUser()
            .subscribe(resp => {
                this.systemColonizations = resp;
                this.updateWithFreshColonization(colo);
                this.dataSource.data = this.systemColonizations;
                this.sortColonizations();
                this.spinnerService.deactivateSpinner();
            });
        this.subscriptions.push(sub);
        this.fetchMainPlanetsDeposit();
    }

    private updateWithFreshColonization(colo: Colonization | undefined) {
        if (!!colo) {
            const idStarSystem: number | undefined = colo?.target.starSystem.id;
            const idPlanet = colo?.target.idPlanet;
            this.systemColonizations.forEach(sys => {
                if (!!idPlanet && sys.starSystem.idStarSystem === idStarSystem) {
                    const colonizationsByPlanetElement = sys.colonizationsByPlanet[idPlanet];
                    if (!colonizationsByPlanetElement) {
                        sys.colonizationsByPlanet[idPlanet] = colo;
                    }
                }
            });
        }
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

    private colonizePlanet(planet: Planet) {
        this.spinnerService.activateSpinner('expansion.organize.spinner-message.wait');
        let sub = this.colonizationApi.startColonizingPlanet(planet).subscribe(resp => {
            this.spinnerService.deactivateSpinner();
            this.fetchData(resp);
        });
        this.subscriptions.push(sub);
    }

    openColoDialog(planet: Planet) {

        const idStarSystem = planet.starSystem.id;
        const starSystemColonization = this.systemColonizations
            .filter(c => c.starSystem.idStarSystem == idStarSystem)[0];
        const travelTime = starSystemColonization.travelTimeMap[idStarSystem];

        const dialogConfig = DialogConfigHelper.createDialog();
        dialogConfig.data = new DialogData(
            'Start colonization of ' + planet.name + '?',
            'This will take ' + travelTime + ' Ticks.',
            'Please be aware that a new colony need a lot people. A colony could disturb the activation of buildings and ships.');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.colonizePlanet(planet);
            }
        })
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
