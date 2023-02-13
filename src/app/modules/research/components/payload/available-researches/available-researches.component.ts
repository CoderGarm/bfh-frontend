import {AfterViewInit, Component} from '@angular/core';
import {ResearchApiService, ResearchLevel} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-available-researches',
    templateUrl: './available-researches.component.html',
    styleUrls: ['./available-researches.component.scss']
})
export class AvailableResearchesComponent extends SubscriptionManager implements AfterViewInit {

    availableResearches: ResearchLevel[] = [];

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: ResearchLevel;

    /**
     * if starting a research job is possible
     */
    researchPossible: boolean = false;

    constructor(private researchApi: ResearchApiService) {
        super();
    }

    ngAfterViewInit() {
        let sub = this.researchApi.getAvailableResearchByUser().subscribe(resp => this.availableResearches = resp);
        this.subscriptions.push(sub);

        sub = this.researchApi.researchPossibleForUser().subscribe(resp => this.researchPossible = resp);
        this.subscriptions.push(sub);
    }

    /**
     * starts a research job
     *
     * @param research the research with it's level to run as job
     */
    runResearch(research: ResearchLevel) {
        if (!!research) {
            let sub = this.researchApi.startResearchByUser(research).subscribe(resp => this.researchPossible = false);
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the opened item
     * @param itemIndex
     */
    setOpened(itemIndex: ResearchLevel) {
        this.currentlyOpenedItemIndex = itemIndex;
    }

    /**
     * sets the {@link currentlyOpenedItemIndex} for the closed item
     * @param itemIndex
     */
    setClosed(itemIndex: ResearchLevel) {
        if (this.currentlyOpenedItemIndex === itemIndex) {
            this.currentlyOpenedItemIndex = undefined;
        }
    }

    /**
     * returns true if the description should be displayed, false otherwise
     * @param research
     */
    showDescription(research: ResearchLevel): boolean {
        return this.currentlyOpenedItemIndex != research;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    /**
     * checks if this particular research is possible
     *
     * @param researchLevel the research
     */
    isResearchPossible(researchLevel: ResearchLevel): boolean {
        if (!this.researchPossible) {
            return false;
        }
        return researchLevel.level < researchLevel.research.levelCap;
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(researchLevel: ResearchLevel): string {
        let hasIcon = researchLevel.research.hasIcon;
        if (!hasIcon) {
            return '';
        }
        let folder = hasIcon.folder;
        let iconName = hasIcon.iconName;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }

    getInvisibility(researchLevel: ResearchLevel) {
        return this.currentlyOpenedItemIndex === researchLevel ? 'invisible' : '';
    }
}
