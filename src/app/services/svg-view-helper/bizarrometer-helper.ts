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

        const fontSize = {size: this.scale(35000)};// fixme scaling is jumpy here, too
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

        const y1 = <number>lidarBox.y();
        const y2 = <number>lidarBox.y() + <number>lidarBox.height();
        const xStart = <number>lidarBox.x() + (textHeight * 2);
        const xEnd = xStart + <number>lidarBox.width() - (textHeight * 2);
        const interval = (xEnd - xStart) / 55;
        let intervalRunner: number = interval;

        for (let xRunner = xStart; xRunner < xEnd;) {

            const i = Math.ceil(intervalRunner) / Math.ceil(interval * 55) * 100;
            if (BizarrometerHelper.randomIntFromInterval(0, 100) < 33 && i <= 100) {
                const stroke = BizarrometerHelper.numberToColorRgb(i);
                svg.line(xRunner, y1, xRunner, y2)
                    .addClass('lidar-line')
                    .stroke(stroke);
            }
            xRunner += interval;
            intervalRunner += interval;
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

    private static randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    private static numberToColorRgb(i: number) {
        // we calculate red and green from percent
        var red = Math.floor(255 - (255 * i / 100));
        var green = Math.floor(255 * i / 100);
        // we format to css value and return
        return 'rgb(' + red + ',' + green + ',0)'
    }

    private static numberToColorHsl(i: number) {
        // as the function expects a value between 0 and 1, and red = 0° and green = 120°
        // we convert the input to the appropriate hue value
        var hue = i * 1.2 / 360;
        // we convert hsl to rgb (saturation 100%, lightness 50%)
        var rgb = BizarrometerHelper.hslToRgb(hue, 1, .5);
        // we format to css value and return
        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    }

    private static hslToRgb(h: number, s: number, l: number) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p: number, q: number, t: number) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
    }
}
