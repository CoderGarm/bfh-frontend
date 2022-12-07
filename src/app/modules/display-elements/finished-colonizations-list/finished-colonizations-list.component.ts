import {Component, Input, OnInit} from '@angular/core';
import {FinishedColonization} from "../../../services/swagger";

@Component({
    selector: 'app-finished-colonizations-list',
    templateUrl: './finished-colonizations-list.component.html',
    styleUrls: ['./finished-colonizations-list.component.scss']
})
export class FinishedColonizationsListComponent implements OnInit {

    @Input()
    finishedColonizations: FinishedColonization[] = [];

    constructor() {
    }

    ngOnInit(): void {
    }

}
