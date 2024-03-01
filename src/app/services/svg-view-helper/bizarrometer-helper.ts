import {Distance, FleetMarker, Maneuver, MissileMovement} from "../swagger";
import {G, Line, Rect, Text} from "@svgdotjs/svg.js";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Component} from "@angular/core";
import {BasicViewHelper} from "./basic-view-helper";
import {AppInjector} from "../../app.module";
import {DynamicDistancePipe} from "../pipes/dynamic-distance.pipe";

export interface SimpleRangeAura {
    missileForwardRange: Distance,
    missileBackwardRange: Distance,
    antiMissileForwardRange: Distance,
    antiMissileBackwardRange: Distance
}

interface BizarroBlockContent {
    x: number,
    y: number,
    box: Rect,
    headline: Text
}

@Component({
    template: ''
})
export class BizarrometerHelper extends BasicViewHelper {

    protected showBizarrometer: boolean = true;

    private distancePipe: DynamicDistancePipe = AppInjector.get(DynamicDistancePipe);

    createBizarrometer(position: { x: number; y: number },
                       enemyPosition: { x: number; y: number },
                       auraShift: SimpleRangeAura,
                       fleetMarker: FleetMarker,
                       flyingSalvos: MissileMovement[],
                       missileManeuvers: Maneuver[]) {

        if (!this.showBizarrometer) {
            return;
        }
        // fixme must be look slightly better

        // fixme how to display "GENERAL" instead of first "INFO"?
        // fixme display fleet state (speed, acceleration etc...) in general info block

        let angleFromEnemy: number = Math.ceil(NavigationCalculator.getAngle(enemyPosition, position));
        const placeOnTheLeft: boolean = position.x < enemyPosition.x;
        const auraDistance = Math.max(this.convertToStandardMetric(auraShift.missileForwardRange), this.convertToStandardMetric(auraShift.missileBackwardRange));

        const moved = NavigationCalculator.moveAbout(position.x, position.y, angleFromEnemy, auraDistance);
        let x: number = moved.x;
        let y: number = moved.y;

        const svg = this.getOrCreateMainSubLayerGroup().group()
            .id('bizarro-' + fleetMarker.fleet.id)
            .addClass('bizarrometer');

        const fontSize = {size: this.scaleWithDefault(35000, 15000)}; // fixme scaling is jumpy here, too
        const unit = this.scaleWithDefault(50000, 15000) * 3; // fixme here, too
        const boxWidth = unit * 4;
        const boxHeight = unit;
        const textHeight = unit / 4;

        x = x - (placeOnTheLeft ? boxWidth : 0);
        const headlineBlock = this.createHeadlineBlock(svg, x, y, boxWidth, textHeight, fontSize);

        x = <number>headlineBlock.box.x();
        y = <number>headlineBlock.box.y() + (<number>headlineBlock.box.height() * 1.1);
        const lidarBlock = this.createLidarBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize);

        x = <number>lidarBlock.box.x();
        y = <number>lidarBlock.box.y() + (<number>lidarBlock.box.height() * 1.1);
        const impellerContent = this.createImpellerBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize);

        x = <number>impellerContent.box.x() + (boxWidth / 2);
        const radarBlock = this.createRadarBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize);

        y = <number>radarBlock.box.y() + (<number>radarBlock.box.height() * 1.1);
        const ecmBox = this.createEcmBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize);

        x = <number>lidarBlock.box.x();
        y = <number>impellerContent.box.y() + (<number>impellerContent.box.height() * 1.1);
        const generalInfoBlock = this.createGeneralInfoBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize, auraShift);

        y = <number>generalInfoBlock.box.y() + (<number>generalInfoBlock.box.height() * 1.1);
        this.createInfoBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize, flyingSalvos, missileManeuvers);
    }

    private createGeneralInfoBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number },
                                   auraShift: SimpleRangeAura) {

        const salvoStrings: string[] = [];

        salvoStrings.push('ASM Front ' + this.distancePipe.transform(auraShift.missileForwardRange));
        salvoStrings.push('ASM Rear ' + this.distancePipe.transform(auraShift.missileBackwardRange));
        salvoStrings.push('AMM Front ' + this.distancePipe.transform(auraShift.antiMissileForwardRange));
        salvoStrings.push('AMM Rear ' + this.distancePipe.transform(auraShift.antiMissileBackwardRange));

        const lines = salvoStrings.length;
        const salvoBlocktextHeight = this.getLineHeight(lines, textHeight);
        const box = svg.rect(boxWidth, Math.max(boxHeight, salvoBlocktextHeight))
            .x(x)
            .y(y)
            .addClass('general-info-box');

        const headline = svg.text('INFO')
            .x(<number>box.x() + (textHeight * 1.4))
            .y(<number>box.y() + <number>box.height())
            .font(fontSize)
            .addClass('general-info-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        this.printInfoTextLines(fontSize, lines, salvoStrings, textHeight, svg, box, boxHeight);

        return {x: x, y: y, box: box, headline: headline};
    }

    private printInfoTextLines(fontSize: { size: number }, lines: number, salvoStrings: string[], textHeight: number, svg: G, box: Rect, boxHeight: number) {
        const smallerTextSize = {size: fontSize.size * 0.5};
        for (let i = 0; i < lines; i++) {
            let text = salvoStrings[i];
            const lineShift = this.getLineHeight(i, textHeight);

            svg.text(text)
                .x(<number>box.x() + (textHeight * 2))
                .y(<number>box.y() + (boxHeight / 4) + lineShift)
                .font(smallerTextSize)
                .addClass('info-text-line')
                .addClass(BasicViewHelper.TEXT_FILL_MARKER);
        }
    }

    private createInfoBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number },
                            flyingSalvos: MissileMovement[], missileManeuvers: Maneuver[]) {

        const salvoStrings = flyingSalvos
            .sort((a, b) => b.combatRoundKey - a.combatRoundKey)
            .map(salvo => {
                const id = salvo.movingMissileSalvo.split('-')[0];

                const maneuverPath = missileManeuvers.find(s => s.missileSalvo == salvo.movingMissileSalvo)!;
                const distance = this.distancePipe.transform(salvo.lengthOnTrack);
                const total = this.distancePipe.transform(maneuverPath.totalLength);
                const missileAmount = salvo.missileAmount;
                return id + ', ' + missileAmount + ' missiles, ' + distance + ' / ' + total
            });

        const lines = salvoStrings.length;
        if (lines == 0) {
            return undefined;
        }
        const salvoBlocktextHeight = this.getLineHeight(lines, textHeight);
        const box = svg.rect(boxWidth, Math.max(boxHeight, salvoBlocktextHeight))
            .x(x)
            .y(y)
            .addClass('info-box');

        const headline = svg.text('INFO')
            .x(<number>box.x() + (textHeight * 1.4))
            .y(<number>box.y() + <number>box.height())
            .font(fontSize)
            .addClass('info-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        this.printInfoTextLines(fontSize, lines, salvoStrings, textHeight, svg, box, boxHeight);

        return {x: x, y: y, box: box, headline: headline};
    }

    private getLineHeight(i: number, textHeight: number) {
        return (i * (textHeight * 1.4));
    }

    private createEcmBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number }) {
        const box = svg.rect(boxWidth / 2, boxHeight)
            .x(x)
            .y(y)
            .addClass('ecm-box');

        const headline = svg.text('ECM')
            .cx(<number>box.cx())
            .y(<number>box.y() + textHeight)
            .font(fontSize)
            .addClass('ecm-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        this.createECMBoxSpectrum(box, textHeight, svg);
        return {x: x, y: y, box: box, headline: headline};
    }

    private createRadarBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number }) {
        const box = svg.rect(boxWidth / 2, boxHeight)
            .x(x)
            .y(y)
            .addClass('radar-box');

        const headline = svg.text('RADAR')
            .cx(<number>box.cx())
            .y(<number>box.y() + textHeight)
            .font(fontSize)
            .addClass('radar-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        this.createRadarBoxSpectrum(box, textHeight, svg);
        return {x: x, y: y, box: box, headline: headline};
    }

    private createImpellerBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number }) {
        const box = svg.rect(boxWidth / 2.2, boxHeight + (boxHeight * 1.1))
            .x(x)
            .y(y)
            .addClass('impeller-box');

        const headline = svg.text('IMPELLER')
            .cx(<number>box.cx())
            .y(<number>box.y() + textHeight)
            .font(fontSize)
            .addClass('impeller-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        this.createImpellerBoxSpectrum(box, textHeight, svg);
        return {x: x, y: y, box: box, headline: headline};
    }

    private createLidarBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number }) {

        const box = svg.rect(boxWidth, boxHeight)
            .x(x)
            .y(y)
            .addClass('lidar-box');

        const headline = svg.text('LIDAR')
            .x(<number>box.x() + (textHeight * 1.4))
            .y(<number>box.y() + <number>box.height())
            .font(fontSize)
            .addClass('lidar-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);

        this.createLidarBoxSpectrum(box, textHeight, svg);
        return {x: x, y: y, box: box, headline: headline};
    }

    private createHeadlineBlock(svg: G, x: number, y: number, boxWidth: number, textHeight: number, fontSize: { size: number }): BizarroBlockContent {
        const box = svg.rect(boxWidth, textHeight * 2)
            .x(x)
            .y(y)
            .addClass('bizarro-headline-box');

        const headline: Text = svg.text('Emission Spectra')
            .cx(<number>box.cx())
            .y(<number>box.y() + textHeight)
            .font(fontSize)
            .addClass('bizarro-headline')
            .addClass(BasicViewHelper.TEXT_FILL_MARKER);
        return {x: x, y: y, box: box, headline: headline};
    }

    private createECMBoxSpectrum(box: Rect, textHeight: number, svg: G) {
        const xStart = <number>box.x();
        const xEnd = xStart + <number>box.width();
        const yStart = <number>box.y() + (textHeight * 2);
        const yEnd = <number>box.y() + <number>box.height();

        const interval = (xEnd - xStart) / 5;
        const yRange = (yEnd - yStart) / 2.5;
        const yMedian = yStart + ((yEnd - yStart) / 2);
        const lines: Line[] = [];

        let x = xStart;
        let y = yMedian;
        let x1 = xStart;
        let y1 = yMedian;
        while (x < xEnd) { // fixme implement as path - but was not visible: why?
            x += interval;
            y = yMedian + BizarrometerHelper.randomIntFromInterval(-yRange, yRange);

            if (lines.length > 0) {
                const line1 = lines[lines.length - 1];
                const pointArray = line1.plot();
                const point = pointArray[pointArray.length - 1];
                x1 = point[0];
                y1 = point[1];
            }
            if (x + interval >= xEnd) {
                x = xEnd;
                y = yMedian;
            }
            const line = svg.line(x1, y1, x, y).addClass('ecm-line');
            lines.push(line);
        }
    }

    private createRadarBoxSpectrum(box: Rect, textHeight: number, svg: G) {
        const xStart = <number>box.x();
        const xEnd = xStart + <number>box.width();
        const yStart = <number>box.y() + (textHeight * 2);
        const yEnd = <number>box.y() + <number>box.height();

        const interval = (xEnd - xStart) / 5;
        const yRange = (yEnd - yStart) / 2.5;
        const yMedian = yStart + ((yEnd - yStart) / 2);
        const lines: Line[] = [];

        let x = xStart;
        let y = yMedian;
        let x1 = xStart;
        let y1 = yMedian;
        while (x < xEnd) { // fixme implement as path - but was not visible: why?
            x += interval;
            y = yMedian + BizarrometerHelper.randomIntFromInterval(-yRange, yRange);

            if (lines.length > 0) {
                const line1 = lines[lines.length - 1];
                const pointArray = line1.plot();
                const point = pointArray[pointArray.length - 1];
                x1 = point[0];
                y1 = point[1];
            }
            if (x + interval >= xEnd) {
                x = xEnd;
                y = yMedian;
            }
            const line = svg.line(x1, y1, x, y).addClass('radar-line');
            lines.push(line);
        }
    }

    private createImpellerBoxSpectrum(box: Rect, textHeight: number, svg: G) {
        const xStart = <number>box.x();
        const xEnd = xStart + <number>box.width();
        const yStart = <number>box.y() + (textHeight * 2);
        const yEnd = <number>box.y() + <number>box.height();

        const interval = (yEnd - yStart) / 5;
        const lines: Line[] = [];

        let x = xStart;
        let y = yStart;
        let x1 = xStart;
        let y1 = yStart;
        while (y < yEnd) { // fixme implement as path - but was not visible: why?
            y += interval;
            x = BizarrometerHelper.randomIntFromInterval(xStart, xEnd);

            if (lines.length > 0) {
                const line1 = lines[lines.length - 1];
                const pointArray = line1.plot();
                const point = pointArray[pointArray.length - 1];
                x1 = point[0];
                y1 = point[1];
            }
            if (y + interval >= yEnd) {
                x = xStart;
                y = yEnd;
            }
            const line = svg.line(x1, y1, x, y).addClass('impeller-line');
            lines.push(line);
        }
    }

    private createLidarBoxSpectrum(box: Rect, textHeight: number, svg: G) {
        const y1 = <number>box.y();
        const y2 = <number>box.y() + <number>box.height();
        const xStart = <number>box.x() + (textHeight * 2);
        const xEnd = xStart + <number>box.width() - (textHeight * 2);
        const interval = (xEnd - xStart) / 55;
        let intervalRunner: number = interval;

        for (let xRunner = xStart; xRunner <= xEnd;) {

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
    }

    private scale(value: number) {
        return Math.ceil(value / Math.max(1, this.zoomScale));
    }

    private scaleWithDefault(valueToScale: number, defaultValue: number) {
        // the scaling is way too jumpy from 0 to 5 to work without this kind of mechanic
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
