import {FleetMarker} from "../swagger";
import {G} from "@svgdotjs/svg.js";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Component} from "@angular/core";
import {BasicViewHelper} from "./basic-view-helper";


@Component({
    template: ''
})
export class BizarrometerHelper extends BasicViewHelper {

    createSVG(position: { x: number; y: number },
              enemyPosition: { x: number; y: number },
              auraShift: { missileForwardShift: number, antiMissileForwardShift: number },
              fm: FleetMarker, parent: G) {

        const auraDistance = Math.max(auraShift.missileForwardShift, auraShift.antiMissileForwardShift);
        let angleFromEnemy: number = Math.ceil(NavigationCalculator.getAngle(enemyPosition, position));
        const placeOnTheLeft: boolean = angleFromEnemy > 180;

        const moved = NavigationCalculator.moveAbout(position.x, position.y, angleFromEnemy, auraDistance);
        let x: number = moved.x;
        let y: number = moved.y;


        const svg = parent.group()
            .id('bizarro-' + fm.fleet.id)
            .addClass('bizarrometer');

        const fontSize = {size: this.scale(50000)};// fixme scaling is jumpy here, too
        const unit = this.scaleWithDefault(50000, 15000) * 3;
        const boxWidth = unit * 4;
        const boxHeigth = unit;
        const textHeight = unit / 4;

        const headlineBox = svg.rect(boxWidth, textHeight * 2)
            .x(x - (placeOnTheLeft ? boxWidth : 0))
            .y(y)
            .addClass('bizarro-headline-box');

        const headlineText = svg.text('Emission Spectra')
            .cx(<number>headlineBox.cx())
            .y(<number>headlineBox.y() + textHeight)
            .font(fontSize)
            .addClass('bizarro-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        x = <number>headlineBox.x();
        y = <number>headlineBox.y() + (<number>headlineBox.height() * 1.1);
        const lidarBox = svg.rect(boxWidth, boxHeigth)
            .x(x)
            .y(y)
            .addClass('lidar-box');

        const lidarHeadline = svg.text('LIDAR')
            .x(<number>lidarBox.x() + (textHeight * 2))
            .y(<number>lidarBox.y() + <number>lidarBox.height())
            .font(fontSize)
            .addClass('lidar-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        for (let i = 0; i < 15; i++) {
            let xi = x + (i * 2);
            svg.line(xi, y, xi, y + 10)
                .addClass('lidar-line');
        }

        x = <number>lidarBox.x();
        y = <number>lidarBox.y() + (<number>lidarBox.height() * 1.1);
        const impellerBox = svg.rect(boxWidth / 2.2, boxHeigth + (boxHeigth * 1.1))
            .x(x)
            .y(y)
            .addClass('impeller-box');

        const impellerHeadline = svg.text('IMPELLER')
            .cx(<number>impellerBox.cx())
            .y(<number>impellerBox.y() + textHeight)
            .font(fontSize)
            .addClass('impeller-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        x = <number>impellerBox.x() + (boxWidth / 2);
        const radarBox = svg.rect(boxWidth / 2, boxHeigth)
            .x(x)
            .y(y)
            .addClass('radar-box');

        const radarHeadline = svg.text('RADAR')
            .cx(<number>radarBox.cx())
            .y(<number>radarBox.y() + textHeight)
            .font(fontSize)
            .addClass('radar-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        y = <number>radarBox.y() + (<number>radarBox.height() * 1.1);
        const ecmBox = svg.rect(boxWidth / 2, boxHeigth)
            .x(x)
            .y(y)
            .addClass('ecm-box');

        const ecmHeadline = svg.text('ECM')
            .cx(<number>ecmBox.cx())
            .y(<number>ecmBox.y() + textHeight)
            .font(fontSize)
            .addClass('ecm-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);
    }

    private scale(value: number) {
        return Math.ceil(value / Math.max(1, this.zoomScale));
    }

    private scaleWithDefault(valueToScale: number, defaultValue: number) {
        // the scaling is way to jumpy from 0 to 5 to work without this kind of mechanic
        const scaler = Math.max(1, this.zoomScale);
        return scaler == 1 ? defaultValue : Math.ceil(valueToScale / scaler);
    }
}
