import {ArrayXY, Circle, CurveCommand, Dom, Element, G, LineCommand, Path, PathArrayAlias, Rect, StrokeData, SVG, Svg, Text} from "@svgdotjs/svg.js";
import {Component, HostListener} from "@angular/core";
import {MapData} from "./map-data.component";
import '@svgdotjs/svg.panzoom.js'
import '@svgdotjs/svg.filter.js'
import {MissionMapComponent} from "./mission-map.component";
import {LocalMapOrbitDefinition} from "./local-map-orbit-definition";
import {EnumValueDto} from "../../../../services/swagger";
import {Coords} from "../mission-administration/mission-administration.component";
import {BasicViewHelper} from "../../../../services/svg-view-helper/basic-view-helper";
import EMissionTypesEnum = EnumValueDto.EMissionTypesEnum;

interface ElementToParent {
    parent: Dom;
    element?: Element;
}

@Component({
    template: ''
})
export class MapDataProvider extends MapData {

    protected canvas?: Svg;

    public static readonly PAN_ZOOM_OPTIONS = {
        // https://github.com/svgdotjs/svg.panzoom.js/blob/master/readme.md
        zoomFactor: 0.3, // zooming per wheel tick
        zoomMin: 0.1, // zoom max out to display the full svg payload as 20% of the screen
        zoomMax: 4 // zoom max 4 times in
    };

    constructor() {
        super();
    }

    protected static readonly ROUND_CAP_MARKER_X_PIXEL_SHIFT: number = 9;
    protected static readonly ROUND_CAP_MARKER_Y_PIXEL_SHIFT: number = 8;

    public static readonly NONE_FILL_COLOR = "none";

    private static readonly COORD_CROSS = "coordCross";
    protected static readonly HIGHLIGHTED_SYSTEM_MARKER_CSS_CLASS = "highlighted";
    protected static readonly NO_MISSION_SYSTEM_MARKER_CSS_CLASS = "no-mission";
    protected static readonly MULTI_MISSION_SYSTEM_MARKER_CSS_CLASS = "multi-mission";

    protected static readonly PLANET_RADIUS = 5;
    protected static readonly STAR_RADIUS = 5;
    protected static readonly STAR_RADIUS_IN_SYSTEM = 15;
    protected static readonly HEAT_MAP_LENGTH = 30;

    protected static readonly INVISIBLE_CLASS = "invisible";

    protected aspectRatio: number = 1;

    protected zoomLevel: number = 1;

    // noinspection JSUnusedLocalSymbols
    @HostListener('window:resize', ['$event'])
    onResize(event?: UIEvent) {
        this.determineAspectRatio();
    }

    // noinspection JSUnusedLocalSymbols
    @HostListener('window:click', ['$event'])
    onClick(event?: UIEvent) {
        this.determineAspectRatio();
    }

    private determineAspectRatio() {
        let screenHeight = window.innerHeight;
        let screenWidth = window.innerWidth;
        this.aspectRatio = screenWidth / screenHeight;
    }

    override clearData() {
        if (!!this.canvas) {
            // remove all elements from canvas a little bit more performant
            this.canvas.node.innerHTML = '';
            super.clearData();
        }
    }

    createCanvas(id: string, parentCssId: string): Svg {
        if (!this.canvas) {
            this.canvas = SVG().id(id).addTo(parentCssId).panZoom(MapDataProvider.PAN_ZOOM_OPTIONS);
            this.canvas
                .on('zoom', this.zoomModification)
                .mouseover(this.mouseoverForText)
                .mouseout(this.mouseoutForText);
        }
        return this.canvas;
    }

    private zoomModification = (ev: any) => {
        this.zoomLevel = ev.detail.level;
        this.zoomResizableContents();
        // must be zoomed after all others
        this.zoomCyclingCircles();
        this.zoomTexts();
    }

    private zoomTexts() {
        if (this.zoomLevel <= 1) {
            return;
        }

        let texts = this.canvas!.children()
            // dont resize dot texts
            .filter(c => c.classes().filter(css => css == MapData.MOVABLE_STATE_DOT_MARKER).length == 0)
            .filter(c => c.classes().filter(css => css == MapData.TEXT_MARKER).length > 0);
        texts.forEach(text => this.resizeText(<Text>text));
    }

    private zoomCyclingCircles() {
        if (this.zoomLevel <= 1) {
            return;
        }

        const circles: Element[] = this.canvas!.children().filter(elem => elem.id().endsWith(MapData.CYCLING_CIRCLE_SUFFIX));
        circles.forEach(dot => {
            if (dot instanceof Circle) {
                const cssClass = dot.classes().filter(css => css.startsWith(MapData.ICON_ID_MARKER));
                const id = cssClass![0].replace(MapData.ICON_ID_MARKER, '');
                const isInvisible = dot.classes().filter(css => css === MapDataProvider.INVISIBLE_CLASS).length > 0;
                const fleet: G | undefined = this.getGroupById(id);
                const celestial: Circle | undefined = this.getCelestialByID(id);
                let element: Element | undefined = !!fleet ? fleet : !!celestial ? celestial : undefined;
                if (!!element) {
                    this.canvas?.removeElement(dot)
                    this.drawCyclingCircle(element.cx(), element.cy(), id, isInvisible);
                }
            }
        });
    }

    protected zoomStroke(strokeData: StrokeData) {
        const stroke = strokeData;
        const width = stroke.width! / this.zoomLevel;
        stroke.width = width < 0.3 ? 0.3 : width;
        if (!!stroke.dasharray) {
            let number = stroke.width * 3 < 4 ? 4 : stroke.width * 3;
            stroke.dasharray = (number / this.zoomLevel) + "px";
        }
        return stroke;
    }

    private zoomResizableContents() {
        const drawingGroup = this.getOrCreateMainCelestialGroup();
        const elements = drawingGroup.children().filter(c => c.classes().filter(c => c == MapData.RESIZE_ON_ZOOM_MARKER).length != 0);
        elements!.forEach(c => {
            if ('radius' in c) {
                this.resizeCelestial(c);
            }
            if (c.classes().filter(c => c == MapData.ROUND_CAP_MARKER).length != 0) {
                this.repositioningRoundCap(c);
            }
            if (c.classes().filter(c => c == MapData.WORMHOLE_MARKER).length != 0) {
                c.stroke(this.zoomStroke({width: 1, color: 'irrelevant'}));
            }
        });
        this.getOrCreateMainHeatMapGroup().children()
            .filter(c => c.classes().filter(c => c == MapData.HEAT_MAP_MARKER).length != 0)
            .forEach(c => this.repositioningHeatMap(c))
    }

    protected getOrCreateMainCelestialGroup() {
        const mainGroups = this.canvas!.children().filter(c => c.id() === MapData.CELESTIAL_MAIN_GROUP);
        if (mainGroups.length > 0) {
            return <G>mainGroups[0]!;
        } else {
            // makes sure that it is below the group with interactable content
            this.getOrCreateMainHeatMapGroup();
            return this.canvas!.group().id(MapData.CELESTIAL_MAIN_GROUP);
        }
    }

    protected getOrCreateMainHeatMapGroup() {
        const mainGroups = this.canvas!.children().filter(c => c.id() === MapData.HEAT_MAP_GROUP);
        if (mainGroups.length > 0) {
            return <G>mainGroups[0]!;
        } else {
            return this.canvas!.group().id(MapData.HEAT_MAP_GROUP);
        }
    }

    private repositioningRoundCap(c: Element) {
        const path = <Path>c;
        const center = this.getCoordsFromCenterMarker(path);
        if (!!center) {
            const x = center[0];
            const y = center[1];
            let xShifter = undefined;
            let yShifter = undefined;
            if (this.zoomLevel > 1) {
                xShifter = MapDataProvider.ROUND_CAP_MARKER_X_PIXEL_SHIFT / this.zoomLevel;
                yShifter = MapDataProvider.ROUND_CAP_MARKER_Y_PIXEL_SHIFT / this.zoomLevel;
            }
            let arr = this.createRoundCapMarkerNorthPoints(x, y, xShifter, yShifter);
            path.plot(arr)
        }
    }

    private repositioningHeatMap(c: Element) {
        const rect = <Rect>c;
        const center = this.getCoordsFromCenterMarker(rect);
        if (!!center) {
            let x = center[0];
            let y = center[1];
            if (this.zoomLevel > 1) {
                x = x / this.zoomLevel;
                y = y / this.zoomLevel;
                rect.x(x).y(y).width(MapDataProvider.HEAT_MAP_LENGTH / this.zoomLevel).height(MapDataProvider.HEAT_MAP_LENGTH / this.zoomLevel);
            }
        }
    }

    private resizeCelestial(c: Element) {
        let baseRadius = MapDataProvider.PLANET_RADIUS;
        const isStar = c.classes().filter(c => c == MapData.STAR_MARKER).length != 0;
        if (isStar) {
            baseRadius = MapDataProvider.STAR_RADIUS;
        }
        const isStarInSystem = c.classes().filter(c => c == MapData.STAR_IN_SYSTEM_MARKER).length != 0;
        if (isStarInSystem) {
            baseRadius = MapDataProvider.STAR_RADIUS_IN_SYSTEM;
        }

        const circle = <Circle>c;

        let newRadius = baseRadius
        if (this.zoomLevel > 1) {
            newRadius = baseRadius / this.zoomLevel;
        }
        const radius = circle.node.r.baseVal.value;
        if (newRadius != radius) {
            circle.radius(newRadius);
        }
    }

    protected drawCelestial(orbitDefinition: LocalMapOrbitDefinition, missionTypesToDisplay: EMissionTypesEnum[]) {
        let mainGroup = this.getOrCreateMainCelestialGroup();

        const orbit: Coords = orbitDefinition.celestial;
        let orbitID = this.getOrbitID(orbit);
        let celestialBodyID = this.getCelestialBodyID(orbit);
        this.setOrbitById(orbitID, orbit);

        const x = orbit.x;
        const y = orbit.y;
        const missionTypes = orbitDefinition.missionTypes;
        let celestialColor: string = MissionMapComponent.UN_FOCUSSED_COLOR;

        if (orbitDefinition.isColonized) {
            celestialColor = MissionMapComponent.COLONIZED_COLOR;
            let cssMarker: string = MapDataProvider.HIGHLIGHTED_SYSTEM_MARKER_CSS_CLASS;
            if (missionTypes.length == 0) {
                cssMarker = MapDataProvider.NO_MISSION_SYSTEM_MARKER_CSS_CLASS;
            } else if (missionTypes.length > 1) {
                cssMarker = MapDataProvider.MULTI_MISSION_SYSTEM_MARKER_CSS_CLASS;
            }
            this.createRoundCapMarkerNorth(mainGroup, celestialBodyID, x, y, cssMarker);
        } else if (orbitDefinition.isColonizedByOther) {
            celestialColor = MissionMapComponent.COLONIZED_BY_OTHERS_COLOR;
        } else if (orbitDefinition.isNpc) {
            celestialColor = MissionMapComponent.COLONIZED_BY_NPC_COLOR;
        }

        if (missionTypes.length == 1) {
            const missionType = missionTypes[0];
            if (missionTypesToDisplay.includes(missionType)) {
                switch (missionType) {
                    default:
                        break;
                    case "PIRATE_HUNT":
                        celestialColor = MissionMapComponent.PIRATE_HUNT_COLOR;
                        break;
                    case "CONVOY_PROTECTION":
                        celestialColor = MissionMapComponent.CONVOY_PROTECTION_COLOR;
                        break;
                }
            }
        }

        const circle = mainGroup.circle()
            .x(x)
            .y(y)
            .fill(celestialColor)
            .id(celestialBodyID);

        if (celestialColor === MissionMapComponent.UN_FOCUSSED_COLOR) {
            circle.addClass(MapDataProvider.OPAQUE_CSS_CLASS);
        }

        circle.addClass(MapData.RESIZE_ON_ZOOM_MARKER)
            .addClass(MapDataProvider.CLICKABLE_CSS_CLASS)
            .addClass(MapData.STAR_MARKER)
            .radius(MapDataProvider.STAR_RADIUS);

        this.setCelestialCircleById(celestialBodyID, circle);
        this.setCelestialOrbitById(celestialBodyID, orbit);
        this.setCelestialObjectById(orbitID, orbitDefinition.celestial);
        this.setCelestialObjectById(celestialBodyID, orbitDefinition.celestial);

        let text: Text = new Text()
            .addClass(MapData.TEXT_MARKER)
            .addClass(MapData.ICON_ID_MARKER + celestialBodyID)
            .text(orbitDefinition.celestial.name)
            .x(circle.cx() + 10)
            .y(circle.cy() - 20);

        this.setTextOptions(text);
        this.setTextById(celestialBodyID, text);
    }

    createRoundCapMarkerNorth(mainGroup: G, id: string, x: number, y: number, cssMarker: string) {
        let arr = this.createRoundCapMarkerNorthPoints(x, y, undefined, undefined);
        mainGroup.path(arr)
            .fill(MapDataProvider.NONE_FILL_COLOR)
            .id(id + MapData.ROUND_CAP_SUFFIX)
            .addClass(cssMarker)
            .addClass(MapData.RESIZE_ON_ZOOM_MARKER)
            .addClass(MapData.ROUND_CAP_MARKER)
            .addClass(this.getCenterMarker(x, y));
    }

    protected getCenterMarker(x: number, y: number) {
        return MapData.CENTER_COORDINATES_MARKER + x + MapData.CENTER_COORDINATES_SEPARATOR + y;
    }

    private getCoordsFromCenterMarker(element: Element): ArrayXY | undefined {
        const markers = element.classes().filter(c => c.startsWith(MapData.CENTER_COORDINATES_MARKER));
        if (!!markers && markers.length == 1) {
            const center = this.getCenterCoordinatesFromMarker(markers[0]);
            if (!!center) {
                const x = center[0];
                const y = center[1];
                return [x, y];
            }
        }
        return undefined;
    }

    createRoundCapMarkerNorthPoints(x: number, y: number, xShifter: number | undefined, yShifter: number | undefined) {
        if (!xShifter) {
            xShifter = MapDataProvider.ROUND_CAP_MARKER_X_PIXEL_SHIFT;
        }
        if (!yShifter) {
            yShifter = MapDataProvider.ROUND_CAP_MARKER_Y_PIXEL_SHIFT;
        }
        let x1 = x - xShifter;
        let y1 = y - yShifter;
        let x2 = x + xShifter;
        let y2 = y + yShifter;

        let p1: LineCommand = ["M", x1, y1];
        let p2: CurveCommand = ["A", 1, 1, 1, 1, 1, x2, y2];

        let arr: PathArrayAlias = [p1, p2];
        return arr;
    }

    getCenterCoordinatesFromMarker(cssClass: string): ArrayXY | undefined {
        const split = cssClass.replace(MapData.CENTER_COORDINATES_MARKER, '').split(MapData.CENTER_COORDINATES_SEPARATOR);
        if (!split) {
            return undefined;
        }
        const x = split[0];
        const y = split[1];
        return [Number.parseFloat(x), Number.parseFloat(y)];
    }

    // noinspection JSUnusedLocalSymbols
    private getRadius(element: Element, zoomFactor: number) {
        const box = element.bbox();
        let diameter = Math.ceil(Math.sqrt(Math.pow(Math.ceil(box.width), 2) + Math.pow(Math.ceil(box.height), 2)));

        const linkedElements = this.canvas!.children()
            .filter(c => c.id().startsWith(element.id()))
            .filter(c => !c.id().endsWith(MapData.ORBIT_SUFFIX));
        linkedElements.forEach(inner => {
            const iBox = inner.bbox();
            const dia = Math.ceil(Math.sqrt(Math.pow(Math.ceil(iBox.width), 2) + Math.pow(Math.ceil(iBox.height), 2)));
            if (dia > diameter) {
                diameter = dia;
            }
        });
        // todo bbox is broken and returns incorrect value https://github.com/svgdotjs/svgdom/issues/89
        const zoomedRadius = (diameter / 2);// / zoomFactor; todo zoom needed
        return Math.ceil(zoomedRadius);
    }

    private findElementAndParentById(id: string): ElementToParent {
        let parent: Dom = this.canvas!;
        let element: Element | undefined;
        const group = this.getGroupById(id);
        if (!group) {
            const drawingGroup = this.getOrCreateMainCelestialGroup();
            let elements = drawingGroup.children().filter(value => value.id() == id);
            if (elements.length == 1) {
                element = elements[0];
                parent = drawingGroup;
            } else {
                elements = this.canvas!.children().filter(value => value.id() == id);
                if (elements.length == 1) {
                    element = elements[0];
                }
            }
        } else {
            element = group;
        }
        return {
            parent: parent,
            element: element
        }
    }

    drawCyclingCircle(x: number, y: number, id: string, isInvisible: boolean) {
        const zoomFactor = this.getOrDefaultZoomFactor(this.zoomLevel);
        const elementToParent = this.findElementAndParentById(id);
        let parent: Dom = elementToParent.parent;
        let element: Element | undefined = elementToParent.element;
        if (!!element) {
            const radius = this.getRadius(element, zoomFactor);
            const circle = new Circle().x(x).y(y)
                .id(this.getCyclingCircleId(id))
                .radius(radius)
                .fill(MapDataProvider.NONE_FILL_COLOR)
                .addClass(MapDataProvider.CYCLING_CIRCLE_MARKER)
                .addClass(MapDataProvider.CLICKABLE_CSS_CLASS)
                .addClass(MapData.ICON_ID_MARKER + id)
                .radius(MapDataProvider.STAR_RADIUS * 2);

            if (isInvisible) {
                circle.addClass(MapDataProvider.INVISIBLE_CLASS);
            }

            BasicViewHelper.attachClickMarker(circle);
            parent.removeElement(element);
            parent.add(circle);
            parent.add(element);
        }
    }

    removeCyclingCircle(id: string) {
        if (!id.endsWith(MapData.CYCLING_CIRCLE_SUFFIX)) {
            id = this.getCyclingCircleId(id);
        }

        const elementToParent = this.findElementAndParentById(id);
        let parent: Dom = elementToParent.parent;
        let element: Element | undefined = elementToParent.element;
        if (!!element) {
            parent.removeElement(element);
        }
        return !!element;
    }

    private getStarSystemByEvent = (event: PointerEvent): Coords | undefined => {
        return this.getOrbitOfCelestialByEvent(event);
    };

    mouseoverForText = (event: PointerEvent) => {
        const text = this.getTextByEvent(event);
        if (!!text) {
            this.resizeText(text);
            this.canvas?.add(text)
        }
    }

    private resizeText(text: Text) { // todo text positioned false the first time - why?
        const idMarker = text.classes().filter(css => css.startsWith(MapData.ICON_ID_MARKER));
        if (idMarker.length > 0) {
            const id = idMarker[0].replace(MapData.ICON_ID_MARKER, '');
            const celestial: Circle | undefined = this.getCelestialByID(id);
            let x = undefined;
            let y = undefined;
            if (!!celestial) {
                x = celestial.cx() + (10 / this.zoomLevel);
                y = celestial.cy() - (20 / this.zoomLevel);
            }
            if (!!x && !!y) {
                text.x(x).y(y);
            }
            this.setTextOptions(text);
        }
    }

    private setTextOptions(text: Text) {
        text.font({
            size: 10 / this.zoomLevel
        });
    }

    mouseoutForText = (event: PointerEvent) => {
        const text = this.getTextByEvent(event);
        if (!!text) {
            this.canvas?.removeElement(text)
        }
    }

    public static calculateDistance(firstCoordinate: number, secondCoordinate: number): number {
        return Math.sqrt(Math.pow(firstCoordinate, 2) + Math.pow(secondCoordinate, 2));
    }

    protected override setOrbits(orbits: LocalMapOrbitDefinition[]) {
        super.setOrbits(orbits);
        this.createPolarCoordinateSystem();
    }

    private createPolarCoordinateSystem() {
        let {x, y} = this.getWidestExpanse();
        this.radiusOfCoordinateCross = MapDataProvider.calculateDistance(x, y);
        this.radiusOfCoordinateCross *= 1.1;

        this.createLocalPolarCoordinateSystem(0, 0, this.radiusOfCoordinateCross, 'main');
    }

    protected createLocalPolarCoordinateSystem(xBase: number, yBase: number, radius: number, idPrefix: string) {
        let mainGroup = this.getOrCreateMainCelestialGroup();
        const group = mainGroup.group().id(idPrefix + "-" + MapDataProvider.COORD_CROSS);
        let steps = 6;
        const radiusSteps = radius / steps;
        for (let i = 1; i < steps; i++) {
            group.circle()
                .x(xBase)
                .y(yBase)
                .fill(MapDataProvider.NONE_FILL_COLOR)
                .id(idPrefix + "-" + MapDataProvider.COORD_CROSS + i)
                .addClass(MapDataProvider.COORD_CROSS)
                .radius(radiusSteps * i);
        }
        const degree = 12;
        for (let j = 1; j <= 30; j++) {
            const angle = j * degree;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const points: ArrayXY[] = [[xBase, yBase], [xBase + x, yBase + y]];
            group.line(points)
                .id(idPrefix + "-" + MapDataProvider.COORD_CROSS + "-line" + j)
                .addClass(MapDataProvider.COORD_CROSS)
        }
    }

    /**
     * returns the view box string for the svg
     */
    public setViewBox(orbit: Coords | undefined, factor: number) {
        let viewBoxDef: string = "0 0 0 0";
        if (!!this.radiusOfCoordinateCross) {
            let width = this.radiusOfCoordinateCross! * factor;
            let height = this.radiusOfCoordinateCross! * factor;
            let startX = -width;
            let startY = -height / this.aspectRatio;

            let xOffset = 0;
            let yOffset = 0;
            if (!!orbit) {
                xOffset = orbit.x;
                yOffset = orbit.y;
            }

            viewBoxDef = (startX + xOffset) + " " + (startY + yOffset) + " " + width * 2 + " " + height * 2;
        }
        this.canvas!.viewbox(viewBoxDef);
    }
}
