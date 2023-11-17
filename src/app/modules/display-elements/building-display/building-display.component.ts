import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Building, EEducationType, EnumValueDto} from "../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";
import EProductionCategoryEnum = EnumValueDto.EProductionCategoryEnum;
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-building-display',
    templateUrl: './building-display.component.html',
    styleUrls: ['./building-display.component.scss']
})
export class BuildingDisplayComponent implements OnChanges {

    @Input()
    building?: Building;

    descriptionText: string = '';

    constructor(private translate: TranslateService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.createDescriptionText();
    }

    private createDescriptionText() {
        if (!this.building) {
            this.descriptionText = '';
            return;
        }

        let desc: string = '';
        const building = this.building;
        const productionCategory = building.productionCategory;
        const productionTarget = building.productionTarget;

        const productionTargetTypeName = productionTarget.typeName;
        if (productionCategory === EProductionCategoryEnum.PRODUCE) {
            switch (productionTargetTypeName) {
                case EResourceTypeEnum.CONSTRUCTION:
                    desc = this.translate.instant('planetary.constructions.building.PRODUCE.CONSTRUCTION');
                    break;
                case EResourceTypeEnum.ORBITAL_CONSTRUCTION:
                    desc = this.translate.instant('planetary.constructions.building.PRODUCE.ORBITAL_CONSTRUCTION');
                    break;
                case EResourceTypeEnum.RESEARCH:
                    desc = this.translate.instant('planetary.constructions.building.PRODUCE.RESEARCH');
                    break;
                case EResourceTypeEnum.CREDITS:
                case EResourceTypeEnum.METALORE:
                case EResourceTypeEnum.RARE_ELEMENTS:
                case EResourceTypeEnum.HEAVY_METALS:
                    desc = this.translate.instant('planetary.constructions.building.PRODUCE.RESOURCE');
                    break;
                case EResourceTypeEnum.POPULATION:
                    desc = this.translate.instant('planetary.constructions.building.PRODUCE.POPULATION');
                    break;
                default:
                    break
            }
        }
        if (productionCategory === EProductionCategoryEnum.CAPACITY) {
            if (productionTargetTypeName != EResourceTypeEnum.POPULATION) {
                throw new Error("There is a missing definition.");
            }
            desc = this.translate.instant('planetary.constructions.building.CAPACITY.POPULATION');
        }

        if (productionCategory === EProductionCategoryEnum.REFINEMENT) {
            desc = this.translate.instant('planetary.constructions.building.REFINEMENT.POPULATION');
            const refSeq = building.refinementSequence!;
            if (!!refSeq) {
                const from: EEducationType = refSeq!.educt;
                const to: EEducationType = refSeq!.product;
                desc = desc.replace('EDUCT', from.typeName);
                desc = desc.replace('PRODUCT', to.typeName);
            }
        }

        desc = desc.replace('NAME', building.name);
        desc = desc.replace('AMOUNT', '' + building.baseValue);
        desc = desc.replace('WHAT', productionTarget.typeName);

        this.descriptionText = desc;
    }
}
