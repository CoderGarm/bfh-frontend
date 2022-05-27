import {Component, OnInit} from '@angular/core';
import {ResearchApiService, ResearchTree} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../SubscriptionManager";

@Component({
    selector: 'app-tech-tree',
    templateUrl: './tech-tree.component.html',
    styleUrls: ['./tech-tree.component.scss']
})
export class TechTreeComponent extends SubscriptionManager implements OnInit {

    tree?: ResearchTree;

    constructor(private researchApi: ResearchApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.researchApi.getTree().subscribe(resp => this.tree = resp);
        this.subscriptions.push(sub);
    }

}
