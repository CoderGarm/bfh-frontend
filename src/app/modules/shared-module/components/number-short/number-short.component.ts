import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-number-short',
    templateUrl: './number-short.component.html',
    styleUrls: ['./number-short.component.scss']
})
export class NumberShortComponent implements OnInit {

    @Input()
    input?: number;

    @Input()
    color?: string;

    constructor() {
    }

    ngOnInit(): void {
    }

}
