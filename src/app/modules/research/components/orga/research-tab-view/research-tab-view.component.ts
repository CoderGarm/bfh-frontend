import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-research-tab-view',
    templateUrl: './research-tab-view.component.html',
    styleUrls: ['./research-tab-view.component.scss']
})
export class ResearchTabViewComponent implements OnInit {

    static path: string = 'researches';

    actionTabTitles: string[] = [`Available researches`, 'Completed researches', 'Tech tree'];

    constructor() {
    }

    ngOnInit(): void {
    }

}
