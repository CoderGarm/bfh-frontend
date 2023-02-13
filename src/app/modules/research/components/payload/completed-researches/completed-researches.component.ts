import {AfterViewInit, Component} from '@angular/core';
import {ResearchApiService, ResearchLevel} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";

@Component({
    selector: 'app-completed-researches',
    templateUrl: './completed-researches.component.html',
    styleUrls: ['./completed-researches.component.scss']
})
export class CompletedResearchesComponent extends SubscriptionManager implements AfterViewInit {

    completedResearches: ResearchLevel[] = [];

    /**
     * the displayed construction
     */
    currentlyOpenedItemIndex?: ResearchLevel;

    constructor(private researchApi: ResearchApiService) {
        super();
    }

    ngAfterViewInit() {
        let sub = this.researchApi.getResearchByUser().subscribe(resp => this.completedResearches = resp);
        this.subscriptions.push(sub);
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
