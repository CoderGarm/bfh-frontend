import {Component, Input, OnInit} from '@angular/core';
import {SupportFitting} from "../../../services/swagger";

@Component({
    selector: 'app-support-fitting-module-display',
    templateUrl: './support-fitting-module-display.component.html',
    styleUrls: ['./support-fitting-module-display.component.scss']
})
export class SupportFittingModuleDisplayComponent implements OnInit {

    /**
     * the fitting which should be displayed
     */
    @Input()
    fittingInput!: SupportFitting;

    constructor() {
    }

    ngOnInit(): void {
    }

}
