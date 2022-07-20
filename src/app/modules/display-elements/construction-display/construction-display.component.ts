import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {Construction, ERefinementSequence} from "../../../services/swagger";

@Component({
    selector: 'app-construction-display',
    templateUrl: './construction-display.component.html',
    styleUrls: ['./construction-display.component.scss']
})
export class ConstructionDisplayComponent implements AfterViewInit {

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
    constructionPossibleInput?: boolean;

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
}
