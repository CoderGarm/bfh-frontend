import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-research-view',
    templateUrl: './research-view.component.html',
    styleUrls: ['./research-view.component.scss']
})
export class ResearchViewComponent implements OnInit {

    static path: string = 'researches';

    actionTabTitles: string[] = [`Available researches`, 'Completed researches'];

    constructor() {
    }

    ngOnInit(): void {
    }

}
