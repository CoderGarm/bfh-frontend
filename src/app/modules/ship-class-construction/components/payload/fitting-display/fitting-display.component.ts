import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {EnumValueDto, ResourceDeposit, ResourcesApiService, ShipClass} from "../../../../../services/swagger";
import {ShipClassComparator} from "../ship-class.comparator";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {TypeService} from "../../../../../services/type.service";
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;
import EAlignmentTypeEnum = EnumValueDto.EAlignmentTypeEnum;

@Component({
    selector: 'app-fitting-display',
    templateUrl: './fitting-display.component.html',
    styleUrls: ['./fitting-display.component.scss']
})
export class FittingDisplayComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * The user selected ShipClass.
     */
    @Input()
    shipClass?: ShipClass;
    selectedShipClassInputDefinition: string = "shipClass";

    /**
     * listens to the parents event which tab is selected
     */
    @Input()
    selectedIndexInput?: EventEmitter<number>;
    selectedIndexInputDefinition: string = "selectedIndexInput";

    /**
     * emits an event if this component was selected in the parent's tab group and was rendered
     */
    @Output()
    isSelectedOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input()
    resourceDeposit?: ResourceDeposit;

    /**
     * the css selector which should be used to create the svg div in the svg component
     */
    svgSelector: string = "ship-class-fitting-display";

    /**
     * the displayed ship class name
     */
    shipClassName: string = "";

    costs?: ResourceDeposit;

    compareClass?: ShipClass;

    alignmentAreas: EAlignmentTypeEnum[];
    weaponTypes: EWeaponTypeEnum[];
    weaponAlignmentTypes: EWeaponAlignmentEnum[];

    constructor(private resourceApi: ResourcesApiService,
                private typeService: TypeService) {
        super();

        this.alignmentAreas = this.typeService.alignmentAreas;
        this.weaponTypes = this.typeService.weaponTypes;
        this.weaponAlignmentTypes = this.typeService.weaponAlignmentTypes;
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedIndexInputDefinition]) {
            if (!!this.selectedIndexInput) {
                let sub = this.selectedIndexInput.subscribe(event => {
                    if (event == 0) {
                        this.isSelectedOutput.emit(true);
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        if (changes[this.selectedShipClassInputDefinition]) {
            if (!!this.shipClass) {
                this.shipClassName = this.shipClass.name;
            } else {
                this.shipClassName = "";
            }
        }
        this.getCosts();
    }

    /**
     * fetches the costs for the current selected ship class
     * @private
     */
    private getCosts() {
        if (!!this.shipClass && this.idChangePending()) {
            let sub = this.resourceApi.getShipClassCosts(this.shipClass)
                .subscribe(resp => this.costs = resp);
            this.subscriptions.push(sub);
        } else if (!this.shipClass) {
            this.costs = undefined;
            this.compareClass = undefined;
        }
    }

    /**
     * detects if there is a change from the last to the current version
     * @private
     */
    private idChangePending() {
        let result: boolean = false;
        if (!!this.compareClass && !!this.shipClass) {
            result = !ShipClassComparator.equals(this.compareClass, this.shipClass);
        } else if (!this.compareClass && !!this.shipClass) {
            result = true;
        }
        this.compareClass = this.shipClass;
        return result;
    }
}
