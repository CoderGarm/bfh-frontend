import {Component, Input} from '@angular/core';
import {Distance} from "../../../services/swagger";

@Component({
    selector: 'app-map-zoom-scale',
    templateUrl: './map-zoom-scale.component.html',
    styleUrls: ['./map-zoom-scale.component.scss']
})
export class MapZoomScaleComponent {

    @Input()
    zoomScale: number = 1;

    @Input()
    height?: Distance;

    @Input()
    width?: Distance;


}
