import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-journal-tab-view',
    templateUrl: './journal-tab-view.component.html',
    styleUrls: ['./journal-tab-view.component.scss']
})
export class JournalTabViewComponent implements OnInit {

    static path: string = 'journal';

    constructor() {
    }

    ngOnInit(): void {
    }

}
