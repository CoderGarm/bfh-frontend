import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from "@angular/material/tabs";

@Component({
    selector: 'app-journal-tab-view',
    templateUrl: './journal-tab-view.component.html',
    styleUrls: ['./journal-tab-view.component.scss']
})
export class JournalTabViewComponent implements OnInit {

    static path: string = "journal";

    actionTabTitles: string[] = ['Dashboard', 'Battle reports', 'Movement reports', 'Job reports'];

    @ViewChild((MatTabGroup))
    matTabGroup?: MatTabGroup;

    constructor() {
    }

    ngOnInit(): void {
    }

}
