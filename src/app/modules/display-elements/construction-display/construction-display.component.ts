import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Construction, ERefinementSequence, ResourceDeposit} from "../../../services/swagger";
import {ResourceHelper} from "../../../ResourceHelper";

@Component({
    selector: 'app-construction-display',
    templateUrl: './construction-display.component.html',
    styleUrls: ['./construction-display.component.scss']
})
export class ConstructionDisplayComponent implements AfterViewInit, OnChanges {

    /**
     * the construction which should be displayed
     */
    @Input()
    constructionInput!: Construction;

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
        this.constructionOutput.emit(this.constructionInput);
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(): string {
        if (!!this.constructionInput) {
            let folder = this.constructionInput.building.productionTarget.folder;
            let iconName = this.constructionInput.building.productionTarget.iconName;
            return "assets/" + folder + "/png24x/" + iconName + "_c.png";
        }
        return "";
    }

    getRefinementDescription(refSeq: ERefinementSequence) {
        return refSeq.educt.typeName + " to " + refSeq.product.typeName
    }

    private checkBalances() {
        if (!this.costsToDisplay || !this.resourceDeposit) {
            this.jobTooExpensive = true;
            return;
        }
        this.jobTooExpensive = !ResourceHelper.canPayTheBill(this.costsToDisplay, this.resourceDeposit);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.checkBalances();
    }
}
