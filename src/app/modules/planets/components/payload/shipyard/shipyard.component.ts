import {AfterContentInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {
    EnumValueDto,
    EShipClassType,
    Fleet,
    Mass,
    OrbitalModule,
    Planet,
    PlanetApiService,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipyardApiService,
    ShipyardConstructionOrder,
    ShipyardConstructionSelection,
    ShipyardOrbitalModuleConstructionSelection
} from "../../../../../services/swagger";
import {UntypedFormControl} from "@angular/forms";
import {MatChip, MatChipListbox} from "@angular/material/chips";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {PlanetsEventService} from "../../../planets-event.service";
import {ResourceHelper} from "../../../../../services/helper/resource.helper";
import {TypeService} from "../../../../../services/type.service";
import {TranslateService} from "@ngx-translate/core";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {FleetEventService} from "../../../../../services/intercom/fleet-event.service";
import ECapacityAreaTypesEnum = EnumValueDto.ECapacityAreaTypesEnum;

@Component({
    selector: 'app-shipyard',
    templateUrl: './shipyard.component.html',
    styleUrls: ['./shipyard.component.scss']
})
export class ShipyardComponent extends SubscriptionManager implements AfterContentInit, OnChanges {

    possibleShipClasses: ShipClass[] = [];

    filteredShipClasses: ShipClass[] = [];

    possibleOrbitalModules: OrbitalModule[] = [];

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    selectedPlanet?: Planet;
    private selectedPlanetDefinition = "selectedPlanet";

    resourceDeposit?: ResourceDeposit;
    income?: ResourceDeposit;

    @Input()
    fleetsInOrbit?: Fleet[];

    /**
     * all EResourceType enum elements
     */
    eHullTypes: EShipClassType[] = [];

    /**
     * some needed form controls to use the mat chip list
     */
    eHullTypeFC: UntypedFormControl = new UntypedFormControl({});

    /**
     * the EResourceType mat chip list
     */
    @ViewChild('hullTypeChipList')
    hullTypeChipList!: MatChipListbox;

    buildShipClass?: ShipyardConstructionSelection;
    private buildShipClassDefinition: string = "buildShipClass";

    shipyardJobPossible: boolean = false;
    jobTooExpensive: boolean = false;

    order?: ShipyardConstructionOrder;

    shipJobSelection: ShipyardConstructionSelection[] = [];
    structureJobSelection: ShipyardOrbitalModuleConstructionSelection[] = [];

    costsToDisplay?: ResourceDeposit;

    hasSomeShipsForBuildSelected: boolean = false;

    translations: Map<string, string> = new Map<string, string>();
    tabIndex: number = 0;

    constructor(private shipyardApi: ShipyardApiService,
                private typeService: TypeService,
                private planetApi: PlanetApiService,
                private resourceService: ResourcesApiService,
                private notificationService: SnackbarNotificationService,
                private planetsNotificationService: PlanetsEventService,
                private fleetEventservice: FleetEventService,
                private translate: TranslateService) {
        super();

        let sub = this.typeService.shipClassTypes.subscribe(d => this.eHullTypes = d);
        this.subscriptions.push(sub);

        this.translations.set('shipyard.constructions.build.already-in-use', 'shipyard.constructions.build.already-in-use');
        sub = this.translate.get('shipyard.constructions.build.already-in-use').subscribe((translated: string) => {
            this.translations.set('shipyard.constructions.build.already-in-use', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('shipyard.constructions.build.too-expensive', 'shipyard.constructions.build.too-expensive');
        sub = this.translate.get('shipyard.constructions.build.too-expensive').subscribe((translated: string) => {
            this.translations.set('shipyard.constructions.build.too-expensive', translated);
        });
        this.subscriptions.push(sub);
    }

    ngAfterContentInit(): void {
        this.setHullTypeFormControlData();
        this.filterDisplayedShipClasses();
        const sub = this.planetsNotificationService.getConstructionStartsEmitter().subscribe(() => this.updateDepositsAndIncome());
        this.subscriptions.push(sub);
    }

    /**
     * sets the data as string to the fc
     * @private
     */
    private setHullTypeFormControlData() {
        let typeNames = this.eHullTypes.map(r => r.typeName);
        this.eHullTypeFC.setValue(typeNames);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedPlanetDefinition]) {
            if (this.selectedPlanet) {
                let sub = this.shipyardApi.getShipClassesByUser().subscribe(resp => {
                    this.possibleShipClasses = resp.filter(s => !(s.name === 'Songbird' && s.mark === 1));
                    this.filterDisplayedShipClasses();
                });
                this.subscriptions.push(sub);

                sub = this.shipyardApi.getOrbitalModulesByUser().subscribe(resp => {
                    this.possibleOrbitalModules = resp
                });
                this.subscriptions.push(sub);
            }

            if (!!this.selectedPlanet && !!this.selectedPlanet.idPlanet) {
                let subscription = this.planetApi.isShipyardJobPossibleOnPlanet(this.selectedPlanet!.idPlanet)
                    .subscribe(resp => this.shipyardJobPossible = resp);
                this.subscriptions.push(subscription);

                this.order = {
                    idPlanet: this.selectedPlanet!.idPlanet,
                    shipJobPayload: [],
                    orbitalsJobPayload: []
                }
                this.updateDepositsAndIncome();
            }
        }

        if (changes[this.buildShipClassDefinition]) {
            // fetch change in ship class build selection and set it into overall selection
            if (!this.order) {
                this.order = {
                    idPlanet: this.selectedPlanet!.idPlanet,
                    shipJobPayload: [],
                    orbitalsJobPayload: []
                }
            }
        }
    }

    private updateDepositsAndIncome() {
        if (!this.selectedPlanet) {
            return;
        }
        let sub = this.resourceService.getResourceDeposit(this.selectedPlanet.idPlanet)
            .subscribe(resp => this.resourceDeposit = resp);
        this.subscriptions.push(sub);
        sub = this.resourceService.getPlanetaryIncome(this.selectedPlanet.idPlanet)
            .subscribe(resp => this.income = resp);
        this.subscriptions.push(sub);
    }

    constructionShips() {
        if (!!this.order) {
            this.order.shipJobPayload = this.shipJobSelection;
            let subscription = this.planetApi.buildShip(this.order).subscribe(resp => {
                if (!!resp) {
                    this.shipyardJobPossible = resp.pointsLeft == 0;
                    if (!this.shipyardJobPossible) {
                        this.notificationService.open("Construction started.")
                    } else {
                        this.notificationService.open("Construction finished.")
                    }
                    this.planetsNotificationService.pushStartedConstruction();
                    this.fleetEventservice.reload();
                } else {
                    this.notificationService.open("This was not possible.")
                }
            });
            this.subscriptions.push(subscription);
        }
    }

    constructionStructures() {
        if (!!this.order) {
            this.order.orbitalsJobPayload = this.structureJobSelection;
            let subscription = this.planetApi.buildOrbitalModule(this.order).subscribe(resp => {
                if (!!resp) {
                    this.shipyardJobPossible = resp.pointsLeft == 0;
                    if (!this.shipyardJobPossible) {
                        this.notificationService.open("Construction started.")
                    } else {
                        this.notificationService.open("Construction finished.")
                    }
                    this.planetsNotificationService.pushStartedConstruction();
                } else {
                    this.notificationService.open("This was not possible.")
                }
            });
            this.subscriptions.push(subscription);
        }
    }

    /**
     * this filters the displayed ship classes by the selected filters
     * @private
     */
    filterDisplayedShipClasses() {
        if (!this.hullTypeChipList) {
            return;
        }
        const selectedResourceTypes: string[] = this.getStringArrayFromMatChips(this.hullTypeChipList.selected);

        this.filteredShipClasses = this.possibleShipClasses.filter(shipClass => {
            return selectedResourceTypes.includes(shipClass.shipClassType.typeName);
        });
    }

    /**
     * just fetches every string from the given mat chip list
     * @param MatChipListbox the chip list
     * @private
     */
    private getStringArrayFromMatChips(MatChipListbox: MatChip[] | MatChip): string[] {
        const selectedResourceTypes: string[] = [];
        if (MatChipListbox instanceof Array) {
            MatChipListbox.forEach(chip => selectedResourceTypes.push(chip.value));
        } else {
            selectedResourceTypes.push(MatChipListbox.value);
        }
        return selectedResourceTypes;
    }

    setAmount(amount: number, shipClass: ShipClass) {
        let element: ShipyardConstructionSelection;
        const selection: ShipyardConstructionSelection[] = this.shipJobSelection.filter(s => s.idShipClass === shipClass.idShipClass);
        if (!!selection && selection.length > 0) {
            element = selection[0];
            const indexOf = this.shipJobSelection.indexOf(element);
            this.shipJobSelection.splice(indexOf, 1);
            element.amount = amount;
        } else {
            element = {
                idShipClass: shipClass.idShipClass!,
                amount: amount
            }
        }
        this.shipJobSelection.push(element);
        if (!!this.order) {
            this.order.shipJobPayload = this.shipJobSelection;
        }
        this.getCostsAndCheckBalances();
    }


    setAmountOrbital(amount: number, module: OrbitalModule) {
        let element: ShipyardOrbitalModuleConstructionSelection;
        const selection: ShipyardOrbitalModuleConstructionSelection[] = this.structureJobSelection.filter(s => s.idOrbitalModule === module.idOrbitalModule);
        if (!!selection && selection.length > 0) {
            element = selection[0];
            const indexOf = this.structureJobSelection.indexOf(element);
            this.structureJobSelection.splice(indexOf, 1);
            element.amount = amount;
        } else {
            element = {
                idOrbitalModule: module.idOrbitalModule!,
                amount: amount
            }
        }
        this.structureJobSelection.push(element);
        if (!!this.order) {
            this.order.orbitalsJobPayload = this.structureJobSelection;
        }
        this.getCostsAndCheckBalances();
    }

    /**
     * fetches the costs for the current selection
     * @private
     */
    private getCostsAndCheckBalances() {
        if (!!this.order && this.shipJobSelection.length != 0) {
            let sub = this.resourceService.getShipyardOrderCosts(this.shipJobSelection)
                .subscribe(resp => {
                    this.costsToDisplay = resp;
                    this.checkBalances();
                });
            this.subscriptions.push(sub);
        }
        if (!!this.order && this.structureJobSelection.length != 0) {
            let sub = this.resourceService.getShipyardStructureOrderCosts(this.structureJobSelection)
                .subscribe(resp => {
                    this.costsToDisplay = resp;
                    this.checkBalances();
                });
            this.subscriptions.push(sub);
        } else {
            this.costsToDisplay = undefined;
            this.jobTooExpensive = false;
        }
        this.detectHasSomeShipsForBuildSelected();
    }

    private checkBalances() {
        if (!this.costsToDisplay || !this.resourceDeposit) {
            this.jobTooExpensive = true;
            return;
        }
        this.jobTooExpensive = !ResourceHelper.canPayTheCollectableBill(this.costsToDisplay, this.resourceDeposit);
    }

    /**
     * toggles all chips depending on the current selected chips
     */
    toggle() {
        if (!!this.hullTypeChipList) {
            let selected = this.hullTypeChipList._chips.filter(chip => chip.selected);
            let unselected = this.hullTypeChipList._chips.filter(chip => !chip.selected);
            if (selected.length > unselected.length) {
                this.hullTypeChipList._chips.forEach(chip => chip.deselect());
            } else {
                this.hullTypeChipList._chips.forEach(chip => chip.select());
            }
            this.filterDisplayedShipClasses();
        }
    }

    private detectHasSomeShipsForBuildSelected() {
        if (!this.order) {
            this.hasSomeShipsForBuildSelected = false;
        } else {
            let amount = 0;
            this.shipJobSelection.forEach(o => amount += o.amount);
            this.structureJobSelection.forEach(o => amount += o.amount);
            this.hasSomeShipsForBuildSelected = amount != 0;
        }
    }

    getJobButtonText() {
        if (!this.shipyardJobPossible) {
            return this.translations.get('shipyard.constructions.build.already-in-use')!;
        }
        if (this.jobTooExpensive) {
            return this.translations.get('shipyard.constructions.build.too-expensive')!;
        }
        if (!this.hasSomeShipsForBuildSelected) {
            return this.translations.get('shipyard.constructions.build.nothing-to-do')!;
        }
        return this.translations.get('shipyard.constructions.build.start-building')!;
    }

    getMass(shipClass: ShipClass): Mass {
        return shipClass.spacecraftCapacityAreas.capacityValues.filter(c => c.capacityArea === ECapacityAreaTypesEnum.OVERALL)[0].tonnage;
    }

    changeTab(event: number) {
        this.tabIndex = event;
        if (this.tabIndex == 0) {
            this.structureJobSelection = [];
        } else {
            this.shipJobSelection = [];
        }
        this.getCostsAndCheckBalances();
    }
}
