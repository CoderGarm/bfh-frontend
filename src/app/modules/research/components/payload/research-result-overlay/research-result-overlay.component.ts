import {Component, HostListener, Input, OnInit} from '@angular/core';
import {CdkOverlayOrigin, ConnectionPositionPair} from "@angular/cdk/overlay";
import {BoxWithContext} from "../tech-tree/tech-tree.component";

@Component({
    selector: 'app-research-result-overlay',
    templateUrl: './research-result-overlay.component.html',
    styleUrls: ['./research-result-overlay.component.scss']
})
export class ResearchResultOverlayComponent implements OnInit {

    screenHeight?: number;
    screenWidth?: number;

    @Input()
    origin: CdkOverlayOrigin = {
        elementRef: {
            nativeElement: {}
        }
    };

    @Input()
    boxWithContext?: BoxWithContext;

    @Input()
    position: ConnectionPositionPair[] = [];

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

    static getPosition(x: number, y: number) {
        return [
            new ConnectionPositionPair({originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'top'}, x, y)
        ];
    }
}
