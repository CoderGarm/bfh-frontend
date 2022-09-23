import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Job} from "../../../services/swagger";

@Component({
    selector: 'app-job-display',
    templateUrl: './job-display.component.html',
    styleUrls: ['./job-display.component.scss']
})
export class JobDisplayComponent implements AfterViewInit, OnChanges {

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    displayJobInput?: Job;
    private displayJobInputDefinition = "displayJobInput";

    constructor() {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.displayJobInputDefinition]) {

        }
    }

    /**
     * returns the title text of this job
     */
    getTitle(): string {
        if (this.displayJobInput!.isBuildingJob) {
            return this.displayJobInput!.buildingTarget!.name + " lvl " + this.displayJobInput!.targetLevel;
        }
        if (this.displayJobInput!.isResearchJob) {
            return this.displayJobInput!.researchTarget!.name + " lvl " + this.displayJobInput!.targetLevel;
        }
        if (this.displayJobInput!.isShipyardJob) {
            return this.displayJobInput!.shipYardTarget!.name + " x" + this.displayJobInput!.amountShips;
        }
        return "";
    }

    /**
     * returns the description text for this job
     */
    getDescription(): string {
        return this.displayJobInput!.ticksLeft + " ticks left";
    }

    getCostsType() {
        return this.displayJobInput!.resourceType;
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(): string {
        if (!!this.displayJobInput) {
            let folder = this.displayJobInput.facility.building.productionTarget.folder;
            let iconName = this.displayJobInput.facility.building.productionTarget.iconName;
            return "assets/" + folder + "/png24x/" + iconName + "_c.png";
        }
        return "";
    }
}
