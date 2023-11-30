import {Component, OnInit} from '@angular/core';
import {BackgroundService} from "../../../../../services/prefetch/background.service";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {ResearchLevel, ResearchTree} from "../../../../../services/swagger";

@Component({
    selector: 'app-research-tab-view',
    templateUrl: './research-tab-view.component.html',
    styleUrls: ['./research-tab-view.component.scss']
})
export class ResearchTabViewComponent extends SubscriptionManager implements OnInit {

    static path: string = 'researches';

    tree?: ResearchTree;
    completedResearches: ResearchLevel[] = [];

    constructor(private backgroundService: BackgroundService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.backgroundService.getResearchTree().subscribe(resp => this.tree = resp);
        this.subscriptions.push(sub);
        sub = this.backgroundService.getCompletedResearches().subscribe(resp => this.completedResearches = resp);
        this.subscriptions.push(sub);
    }
}
