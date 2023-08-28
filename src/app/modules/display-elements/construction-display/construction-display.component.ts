import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Construction, EEducationType, EnumValueDto, ResourceDeposit} from "../../../services/swagger";
import {ResourceHelper} from "../../../services/helper/resource.helper";
import {TranslateService} from "@ngx-translate/core";
import EProductionCategoryEnum = EnumValueDto.EProductionCategoryEnum;
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-construction-display',
    templateUrl: './construction-display.component.html',
    styleUrls: ['./construction-display.component.scss']
})
export class ConstructionDisplayComponent implements AfterViewInit, OnChanges {

    @Input()
    construction?: Construction;

    @Output()
    constructionOutput: EventEmitter<Construction> = new EventEmitter<Construction>();

    @Input()
    isYardFree?: boolean;

    @Input()
    resourceDeposit?: ResourceDeposit;

    @Input()
    costsToDisplay?: ResourceDeposit;

    isTooExpensive: boolean = false;
    output: string = '';
    outputAtLevel: string = '';
    outputAfterBuild: string = '';
    descriptionText: string = '';

    isDisabled: boolean = false;
    disabledMessage: string = '';

    constructor(private translate: TranslateService) {
    }

    ngAfterViewInit() {
    }

    buildConstruction() {
        this.constructionOutput.emit(this.construction);
    }

    private checkBalances() {
        if (!this.costsToDisplay || !this.resourceDeposit) {
            this.isTooExpensive = true;
            return;
        }
        this.isTooExpensive = !ResourceHelper.canPayTheCollectableBill(this.costsToDisplay, this.resourceDeposit);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!!this.costsToDisplay && !!this.resourceDeposit) {
            this.checkBalances();
            this.getOutput();
            this.createDescriptionText();
            this.detectState();
        }
    }

    private detectState() {

        if (!this.isYardFree) {
            this.isDisabled = true;
            this.translate.get('planetary.constructions.build.not-possible').subscribe(tr => this.disabledMessage = tr);
            return;
        }

        if (this.isTooExpensive) {
            // to expensive
            this.isDisabled = true;
            this.translate.get('planetary.constructions.build.too-expensive').subscribe(tr => this.disabledMessage = tr);
            return;
        }

        if (!!this.construction && !this.construction.nextLevel && !(!this.isYardFree && !this.isTooExpensive) && !(this.isTooExpensive && this.isYardFree)) {
            this.isDisabled = true;
            this.translate.get('planetary.constructions.build.must-do-research').subscribe(tr => this.disabledMessage = tr + " '" + this.construction!.building.unlockedThrough + "'");
            return;
        }

        this.isDisabled = false;
        this.disabledMessage = '';
    }

    getOutput() {
        if (!this.construction) {
            this.output = '';
            this.outputAfterBuild = '';
            return;
        }
        this.output = "" + ResourceHelper.calculateLevelOutput(this.construction);
        this.outputAtLevel = "" + ResourceHelper.calculateCurrentOutput(this.construction);
        this.outputAfterBuild = "" + ResourceHelper.calculateNextOutput(this.construction);
    }

    protected readonly EnumValueDto = EnumValueDto;
    protected readonly EProductionCategoryEnum = EProductionCategoryEnum;

    private createDescriptionText() {
        if (!this.construction) {
            this.descriptionText = '';
            return;
        }

        let desc: string = '';
        const building = this.construction.building;
        const productionCategory = building.productionCategory;
        const productionTarget = building.productionTarget;

        const productionTargetTypeName = productionTarget.typeName;
        if (productionCategory === EProductionCategoryEnum.PRODUCE) {
            switch (productionTargetTypeName) {
                case EResourceTypeEnum.CONSTRUCTION:
                    this.translate.get('planetary.constructions.building.PRODUCE.CONSTRUCTION').subscribe(tr => desc = tr);
                    break;
                case EResourceTypeEnum.ORBITAL_CONSTRUCTION:
                    this.translate.get('planetary.constructions.building.PRODUCE.ORBITAL_CONSTRUCTION').subscribe(tr => desc = tr);
                    break;
                case EResourceTypeEnum.RESEARCH:
                    this.translate.get('planetary.constructions.building.PRODUCE.RESEARCH').subscribe(tr => desc = tr);
                    break;
                case EResourceTypeEnum.CREDITS:
                case EResourceTypeEnum.METALORE:
                case EResourceTypeEnum.RARE_ELEMENTS:
                case EResourceTypeEnum.HEAVY_METALS:
                    this.translate.get('planetary.constructions.building.PRODUCE.RESOURCE').subscribe(tr => desc = tr);
                    break;
                case EResourceTypeEnum.POPULATION:
                    this.translate.get('planetary.constructions.building.PRODUCE.POPULATION').subscribe(tr => desc = tr);
                    break;
                default:
                    break
            }
        }
        if (productionCategory === EProductionCategoryEnum.CAPACITY) {
            if (productionTargetTypeName != EResourceTypeEnum.POPULATION) {
                throw new Error("There is a missing definition.");
            }
            this.translate.get('planetary.constructions.building.CAPACITY.POPULATION').subscribe(tr => desc = tr);
        }

        if (productionCategory === EProductionCategoryEnum.REFINEMENT) {
            this.translate.get('planetary.constructions.building.REFINEMENT.POPULATION').subscribe(tr => desc = tr);
            const refSeq = building.refinementSequence!;
            if (!!refSeq) {
                const from: EEducationType = refSeq!.educt;
                const to: EEducationType = refSeq!.product;
                desc = desc.replace('EDUCT', from.typeName);
                desc = desc.replace('PRODUCT', to.typeName);
            }
        }
        const output = ResourceHelper.calculateCurrentOutput(this.construction);
        desc = desc.replace('NAME', building.name);
        desc = desc.replace('AMOUNT', '' + output);
        desc = desc.replace('WHAT', productionTarget.typeName);

        this.descriptionText = desc;
    }
}
