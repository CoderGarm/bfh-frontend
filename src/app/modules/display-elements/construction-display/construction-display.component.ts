import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Construction, ResourceDeposit} from "../../../services/swagger";
import {ResourceHelper} from "../../../services/helper/resource.helper";

@Component({
    selector: 'app-construction-display',
    templateUrl: './construction-display.component.html',
    styleUrls: ['./construction-display.component.scss']
})
export class ConstructionDisplayComponent implements AfterViewInit, OnChanges {

    /**
     * the construction which is displayed
     */
    @Input()
    construction!: Construction;

    @Output()
    constructionOutput: EventEmitter<Construction> = new EventEmitter<Construction>();

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    constructionPossible?: boolean;

    @Input()
    resourceDeposit?: ResourceDeposit;

    @Input()
    costsToDisplay?: ResourceDeposit;

    jobTooExpensive: boolean = false;

    constructor() {
    }

    ngAfterViewInit() {
    }

    buildConstruction() {
        this.constructionOutput.emit(this.construction);
    }

    getRefinementDescription() {
        const refSeq = this.construction.building.refinementSequence;
        return refSeq!.educt.typeName + " to " + refSeq!.product.typeName;
    }

    private checkBalances() {
        if (!this.costsToDisplay || !this.resourceDeposit) {
            this.jobTooExpensive = true;
            return;
        }
        this.jobTooExpensive = !ResourceHelper.canPayTheCollectableBill(this.costsToDisplay, this.resourceDeposit);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!!this.costsToDisplay && !!this.resourceDeposit) {
            this.checkBalances();
        }
    }

    getOutput() {
        return "" + ResourceHelper.calculateLevelOutput(this.construction);
    }
}
