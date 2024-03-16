import {Distance, EnumValueDto, FleetMarker, Maneuver, MissileMovement, MovementAction, WarShip} from "../swagger";
import {G, Line, Rect, SVG, Text} from "@svgdotjs/svg.js";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Component} from "@angular/core";
import {BasicViewHelper} from "./basic-view-helper";
import {AppInjector} from "../../app.module";
import {DynamicDistancePipe} from "../pipes/dynamic-distance.pipe";
import {AccelerationPipe} from "../pipes/acceleration.pipe";
import {VelocityPipe} from "../pipes/velocity.pipe";
import {DistancePipe} from "../pipes/distance.pipe";
import EDistanceMetricsEnum = EnumValueDto.EDistanceMetricsEnum;
import ETimeMetricsEnum = EnumValueDto.ETimeMetricsEnum;
import EAccelerationMetricsEnum = EnumValueDto.EAccelerationMetricsEnum;
import EShipClassTypeEnum = EnumValueDto.EShipClassTypeEnum;
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;

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

    private dynamicDistancePipe: DynamicDistancePipe = AppInjector.get(DynamicDistancePipe);
    private distancePipe: DistancePipe = AppInjector.get(DistancePipe);
    private accelerationPipe: AccelerationPipe = AppInjector.get(AccelerationPipe);
    private velocityPipe: VelocityPipe = AppInjector.get(VelocityPipe);

    private static ORDERED_HULL_TYPES: EShipClassTypeEnum[] = [
        EShipClassTypeEnum.SDP,
        EShipClassTypeEnum.CLAC,
        EShipClassTypeEnum.SD,
        EShipClassTypeEnum.DN,
        EShipClassTypeEnum.BCP,
        EShipClassTypeEnum.BB,
        EShipClassTypeEnum.BC,
        EShipClassTypeEnum.CA,
        EShipClassTypeEnum.CL,
        EShipClassTypeEnum.DD,
        EShipClassTypeEnum.FG,
        EShipClassTypeEnum.VT,
        EShipClassTypeEnum.LAC,
        EShipClassTypeEnum.AE,
        EShipClassTypeEnum.AR,
        EShipClassTypeEnum.FAT,
        EShipClassTypeEnum.FR
    ];

    private static ORDERED_WEAPON_TYPES: EWeaponTypeEnum[] = [
        EWeaponTypeEnum.MISSILE,
        EWeaponTypeEnum.BEAM,
        EWeaponTypeEnum.COUNTER_MISSILE,
        EWeaponTypeEnum.POINT_DEFENSE
    ];

    createBizarrometer(move: MovementAction,
                       activeShips: WarShip[],
                       inactiveShips: WarShip[],
                       position: { x: number; y: number },
                       enemyPosition: { x: number; y: number },
                       auraShift: SimpleRangeAura,
                       fleetMarker: FleetMarker, flyingSalvos: MissileMovement[], missileManeuvers: Maneuver[]) {

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
        const fleetInfoBlock = this.createFleetInfoBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize, move);

        x = <number>lidarBlock.box.x();
        y = <number>fleetInfoBlock.box.y() + (<number>fleetInfoBlock.box.height() * 1.1);
        const fleetCompositionInfoBlock = this.createFleetCompositionInfoBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize, activeShips, inactiveShips);

        x = <number>lidarBlock.box.x();
        y = <number>fleetCompositionInfoBlock.box.y() + (<number>fleetCompositionInfoBlock.box.height() * 1.1);
        const rangeInfoBlock = this.createRangeInfoBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize, auraShift);

        y = <number>rangeInfoBlock.box.y() + (<number>rangeInfoBlock.box.height() * 1.1);
        this.createInfoBlock(svg, x, y, boxWidth, boxHeight, textHeight, fontSize, flyingSalvos, missileManeuvers);
    }

    private createFleetCompositionInfoBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number },
                                            activeShips: WarShip[], inactiveShips: WarShip[]) {

        let tableStyles: string =
            "width: 80%;" +
            "height: PLACYPLACE;" + /* todo height not necessary here? */
            "margin: auto;" +
            "border-spacing: " + fontSize.size / 4 + "px;" +
            "border-collapse: separate;" +
            "font-size: " + fontSize.size + "px;"

        let platformEntries = 0;
        let weaponEntries = 0;
        const activeWarShipsByType: Map<EShipClassTypeEnum, WarShip[]> = BizarrometerHelper.sortWarshipsByHull(activeShips);
        const inactiveWarShipsByType: Map<EShipClassTypeEnum, WarShip[]> = BizarrometerHelper.sortWarshipsByHull(inactiveShips);

        const borderWidth = fontSize.size / 75;
        const borderBottom = "border-bottom: solid " + borderWidth + "px;";
        const borderRight = "border-right: solid " + borderWidth + "px;";

        let table = "<div>";

        const hasShips = activeWarShipsByType.size != 0 || inactiveWarShipsByType.size != 0;
        if (hasShips) {
            // first tbody
            table += "<table style='" + tableStyles + "' class='foreign-object-text'>";
            table += "<tbody>"
            table += "<tr>"
            table += "<td>Platform</td>";
            table += "<td style='" + borderBottom + "' class='foreign-object-table-border'>Active</td>";
            table += "<td style='" + borderBottom + "' class='foreign-object-table-border'>Inactive</td>";
            table += "</tr>"

            BizarrometerHelper.ORDERED_HULL_TYPES.forEach(hullType => {
                let actives = activeWarShipsByType.get(hullType);
                let inactives = inactiveWarShipsByType.get(hullType);
                if (!!actives || !!inactives) {
                    table += "<tr>"
                    table += "<td>" + hullType + "</td>";

                    if (!!actives) {
                        table += "<td>" + actives.length + "</td>";
                    } else {
                        table += "<td>-</td>";
                    }

                    if (!!inactives) {
                        table += "<td>" + inactives.length + "</td>";
                    } else {
                        table += "<td>-</td>";
                    }
                    platformEntries++;
                    table += "</tr>"
                }
            });
            table += "</tbody>"
            table += "</table>"

            // second tbody
            table += "<table style='" + tableStyles + "' class='foreign-object-text'>";
            table += "<tbody>"
            table += "<tr>"
            table += "<td>Armament</td>";
            table += "<td style='" + borderBottom + "' class='foreign-object-table-border'>Active</td>";
            table += "<td style='" + borderBottom + "' class='foreign-object-table-border'>Inactive</td>";
            table += "</tr>"

            BizarrometerHelper.ORDERED_WEAPON_TYPES.forEach(weaponType => {

                const activeWeapons = activeShips
                    .map(ws => ws.shipClass)
                    .flatMap(s => s.fittings)
                    .filter(f => weaponType == f.launcher?.weaponType || weaponType == f.weapon?.weaponType)
                    .map(f => f.amount)
                    .reduce((sum, current) => sum + current, 0);

                const inactiveWeapons = inactiveShips
                    .map(ws => ws.shipClass)
                    .flatMap(s => s.fittings)
                    .filter(f => weaponType == f.launcher?.weaponType || weaponType == f.weapon?.weaponType)
                    .map(f => f.amount)
                    .reduce((sum, current) => sum + current, 0);

                if (activeWeapons > 0 || inactiveWeapons > 0) {
                    table += "<tr>"
                    table += "<td>" + weaponType + "</td>";

                    if (!!activeWeapons) {
                        table += "<td>" + activeWeapons + "</td>";
                    } else {
                        table += "<td>-</td>";
                    }

                    if (!!inactiveWeapons) {
                        table += "<td>" + inactiveWeapons + "</td>";
                    } else {
                        table += "<td>-</td>";
                    }
                    weaponEntries++;
                    table += "</tr>"
                }
            });
            table += "</tbody>"
            table += "</table>";
        }
        table += "</div>";


        const entries = platformEntries + weaponEntries;
        const first = Math.ceil(platformEntries * 100 / entries);
        const second = 100 - first;

        table = table.replace("PLACYPLACE", first + "%");
        table = table.replace("PLACYPLACE", second + "%");

        const height = Math.max(boxHeight, this.getLineHeight(entries + 4, textHeight));
        const box = svg.rect(boxWidth, height)
            .x(x)
            .y(y)
            .addClass('fleet-info-box');

        const foreignObject = svg.foreignObject(<number>box.width(), <number>box.height())
            .x(<number>box.x())
            .y(<number>box.y())

        const element = SVG(table);
        foreignObject.add(element);

        return {x: x, y: y, box: box};
    }


    private static sortWarshipsByHull(warShips: WarShip[]) {
        const warShipsByType: Map<EShipClassTypeEnum, WarShip[]> = new Map<EShipClassTypeEnum, WarShip[]>();

        warShips?.forEach(warShip => {
            const key: EShipClassTypeEnum = warShip.shipClass.shipClassType.typeName as keyof typeof EShipClassTypeEnum;

            let warShips: WarShip[] | undefined = warShipsByType.get(key);
            if (!warShips) {
                warShips = [warShip];
            } else {
                warShips.push(warShip);
            }
            warShipsByType.set(key, warShips);
        });
        return warShipsByType;
    }


    private createFleetInfoBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number },
                                 move: MovementAction) {

        let tableStyles: string =
            "width: 80%;" +
            "height: 100%;" +
            "margin: auto;" +
            "border-spacing: " + fontSize.size / 4 + "px;" +
            "border-collapse: separate;" +
            "font-size: " + fontSize.size + "px;"

        const borderWidth = fontSize.size / 75;
        const borderRight = "border-right: solid " + borderWidth + "px;";

        const table = "<table style='" + tableStyles + "' class='foreign-object-text'>" +
            "<tbody>" +
            "<tr>" +
            "<td style='" + borderRight + "' class='foreign-object-table-border'>Velocity</td>" +
            "<td>" + this.velocityPipe.transform(move.velocity, EDistanceMetricsEnum.KM, ETimeMetricsEnum.SECOND) + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='" + borderRight + "' class='foreign-object-table-border'>Acceleration</td>" +
            "<td>" + this.accelerationPipe.transform(move.acceleration, EAccelerationMetricsEnum.MS2) + "</td>" +
            "</tr>" +
            "</tbody>" +
            "</table>";

        const height = Math.max(boxHeight, this.getLineHeight(2, textHeight));
        const box = svg.rect(boxWidth, height)
            .x(x)
            .y(y)
            .addClass('fleet-info-box');

        const foreignObject = svg.foreignObject(<number>box.width(), <number>box.height())
            .x(<number>box.x())
            .y(<number>box.y())

        const element = SVG(table);
        foreignObject.add(element);

        return {x: x, y: y, box: box};
    }

    private createRangeInfoBlock(svg: G, x: number, y: number, boxWidth: number, boxHeight: number, textHeight: number, fontSize: { size: number },
                                 auraShift: SimpleRangeAura) {

        let tableStyles: string =
            "width: 80%;" +
            "height: 100%;" +
            "margin: auto;" +
            "border-spacing: " + fontSize.size / 4 + "px;" +
            "border-collapse: separate;" +
            "font-size: " + fontSize.size + "px;"


        const borderWidth = fontSize.size / 75;
        const borderBottom = "border-bottom: solid " + borderWidth + "px;";
        const borderRight = "border-right: solid " + borderWidth + "px;";

        const table = "<table style='" + tableStyles + "' class='foreign-object-text'>" +
            "<tbody>" +
            "<tr>" +
            "<td style='" + borderBottom + "' class='foreign-object-table-border'>Range</td>" +
            "<td style='" + borderBottom + "' class='foreign-object-table-border'>Front</td>" +
            "<td style='" + borderBottom + "' class='foreign-object-table-border'>Rear</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='" + borderRight + "' class='foreign-object-table-border'>ASM</td>" +
            "<td>" + this.dynamicDistancePipe.transform(auraShift.missileForwardRange) + "</td>" +
            "<td>" + this.dynamicDistancePipe.transform(auraShift.missileBackwardRange) + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td style='" + borderRight + "' class='foreign-object-table-border'>AMM</td>" +
            "<td>" + this.dynamicDistancePipe.transform(auraShift.antiMissileForwardRange) + "</td>" +
            "<td>" + this.dynamicDistancePipe.transform(auraShift.antiMissileBackwardRange) + "</td>" +
            "</tr>" +
            "</tbody>" +
            "</table>";

        const height = Math.max(boxHeight, this.getLineHeight(4, textHeight));
        const box = svg.rect(boxWidth, height)
            .x(x)
            .y(y)
            .addClass('range-info-box');

        /* fixme use filters
            headline.filterWith(function (add) {
            let blur = add.offset(0, 1).in(add.$sourceAlpha).gaussianBlur(0, 1)

            add.blend(add.$source, blur, 'blur')
            //fixme experiment with filters https://garden.bradwoods.io/notes/svg/filters#listofprimitives
        })
        */

        const foreignObject = svg.foreignObject(<number>box.width(), <number>box.height())
            .x(<number>box.x())
            .y(<number>box.y())

        const element = SVG(table);
        foreignObject.add(element);

        return {x: x, y: y, box: box};
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
                const distance = this.dynamicDistancePipe.transform(salvo.lengthOnTrack);
                const total = this.dynamicDistancePipe.transform(maneuverPath.totalLength);
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
