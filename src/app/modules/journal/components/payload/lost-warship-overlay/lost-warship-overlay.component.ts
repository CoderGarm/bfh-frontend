import {Component, HostListener, Input, OnInit} from '@angular/core';
import {CdkOverlayOrigin, ConnectionPositionPair} from "@angular/cdk/overlay";
import {CombatReport} from "../battle-report/battle-report.component";

@Component({
    selector: 'app-lost-warship-overlay',
    templateUrl: './lost-warship-overlay.component.html',
    styleUrls: ['./lost-warship-overlay.component.scss']
})
export class LostWarshipOverlayComponent implements OnInit {

    screenHeight?: number;
    screenWidth?: number;

    @Input()
    openOverlay: boolean = false;

    @Input()
    origin: CdkOverlayOrigin = {
        elementRef: {
            nativeElement: {}
        }
    };

    @Input()
    report?: CombatReport;

    constructor() {
        this.onResize();
    }

    ngOnInit(): void {
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?: any) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
    }

    getPosition() {
        return [
            new ConnectionPositionPair({
                    originX: 'end',
                    originY: 'top'
                }, {
                    overlayX: 'end',
                    overlayY: 'bottom'
                },
                !!this.screenWidth ? this.screenWidth / 2 : 0,
                0)
        ];
    }
}
