import {Distance, FleetMarker, Move, Orbit, Planet, StarSystem, StateBlock} from "../swagger";
import {ArrayXY, Circle, CurveCommand, Dom, Element, G, LineCommand, Path, PathArrayAlias, Polygon, StrokeData, SVG, Svg, Text} from "@svgdotjs/svg.js";
import {OrbitDefinition} from "../../modules/star-map/payload/orbit-definition";
import {NavigationCalculator} from "../helper/navigation-calculator.helper";
import {Component, HostListener} from "@angular/core";
import {StarMapCommunicationService} from "../intercom/star-map-communication.service";
import {AppInjector} from "../../app.module";
import {BasicViewHelperData} from "./basic-view-helper-data";
import {AssetsService} from "../assets/assets.service";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

interface ElementToParent {
    parent: Dom;
    element?: Element;
}

@Component({
    template: ''
})
export class BasicViewHelper extends BasicViewHelperData {

    protected canvas?: Svg;

    starMapCommService = AppInjector.get(StarMapCommunicationService);
    assetsService: AssetsService = AppInjector.get(AssetsService);

    public static readonly PAN_ZOOM_OPTIONS = {
        // https://github.com/svgdotjs/svg.panzoom.js/blob/master/readme.md
        zoomFactor: 0.3, // zooming per wheel tick
        zoomMin: 0.1, // zoom max out to display the full svg payload as 20% of the screen
        zoomMax: 4 // zoom max 4 times in
    };
    public readonly STANDARD_METRIC;

    constructor(standardDistanceMetric: DistanceMetricEnum) {
        super(standardDistanceMetric);

        this.STANDARD_METRIC = standardDistanceMetric;
        const sub = this.starMapCommService.getDeselectEverythingEmitter().subscribe(() => {
            const elements = this.canvas?.children().filter(elem => elem.id().endsWith(BasicViewHelperData.CYCLING_CIRCLE_SUFFIX) || elem.id().endsWith(BasicViewHelperData.MOVE_SUFFIX));
            if (!!elements && elements.length > 0) {
                elements.forEach(elem => this.canvas?.removeElement(elem));
            }
        });
        this.subscriptions.push(sub);
    }

    protected static readonly STROKE_BLACK: StrokeData = {color: "black", width: 1};
    // noinspection CssConvertColorToRgbInspection
    protected static readonly STROKE_CYCLING_CIRCLE: StrokeData = {color: "orange", width: 3, dasharray: "15px"}; // $metal-glance in variables

    protected static readonly ROUND_CAP_MARKER_X_PIXEL_SHIFT: number = 9;
    protected static readonly ROUND_CAP_MARKER_Y_PIXEL_SHIFT: number = 8;
    protected static readonly STATE_DOT_RADIUS: number = 5;

    protected readonly FLEET_SHARK_COLOR_HOSTILE = "red";
    protected readonly FLEET_SHARK_COLOR_OWN = "green";

    public static readonly NONE_FILL_COLOR = "none";

    private static readonly COORD_CROSS = "coordCross";

    protected static readonly NOT_COLONIZED_COLOR_CSS_CLASS = "not-colonized";
    protected static readonly IS_COLONIZED_BY_USER_COLOR_CSS_CLASS = "colonized-by-user";
    protected static readonly COLONIZED_BY_OTHERS_COLOR_CSS_CLASS = "colonized-by-others";
    protected static readonly COLONIZED_BY_NPC_COLOR_CSS_CLASS = "colonized-by-npc";
    protected static readonly COLONIZABLE_SYSTEM_MARKER_CSS_CLASS = "colonizable";

    protected static readonly PLANET_RADIUS = 5;
    protected static readonly STAR_RADIUS = 5;
    protected static readonly STAR_RADIUS_IN_SYSTEM = 15;

    protected static readonly INVISIBLE_CLASS = "invisible";

    /**
     * If the map is used as external this prefix will be added to all necessary css selectors.
     * Is an ugly idea, but it works until a full rework and separating the external map from the internal one.
     */
    private externalMapPrefix: string = '';

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

    clearData() {
        if (!!this.canvas) {
            // remove all elements from canvas a little bit more performant
            this.canvas.node.innerHTML = '';
            super.clearData();
        }
    }

    protected clearFleets() {

        const groups: G[] = this.getFleetGroups();
        groups.forEach(g => {
            const knownElements = this.canvas!.children().filter(c => c.id() === g.id());
            knownElements.forEach(elem => this.canvas!.removeElement(elem));
        });
        this.clearFleetGroups();
    }

    createCanvas(id: string, parentCssId: string, externalMapPrefix: string = ''): Svg {
        if (!this.canvas) {
            this.externalMapPrefix = externalMapPrefix;
            this.canvas = SVG().id(id).addTo(parentCssId).panZoom(BasicViewHelper.PAN_ZOOM_OPTIONS);
            this.canvas
                .on('zoom', this.zoomModification)
                .mouseover(this.mouseoverForText)
                .mouseout(this.mouseoutForText)
                .click(this.clickEventForCelestial)
                .click(this.clickEventForFleetGroup)
        }
        return this.canvas;
    }

    private zoomModification = (ev: any) => {
        this.zoomLevel = ev.detail.level;
        this.zoomResizableContents();
        this.zoomFleetGroups();
        this.zoomWarshipPolygons();
        // must be zoomed after all others
        this.zoomCyclingCircles();
        this.zoomStateDots();
        this.zoomTexts();
    }

    private zoomTexts() {
        if (this.zoomLevel <= 1) {
            return;
        }

        let texts = this.canvas!.children()
            // dont resize dot texts
            .filter(c => c.classes().filter(css => css == BasicViewHelperData.MOVABLE_STATE_DOT_MARKER).length == 0)
            .filter(c => c.classes().filter(css => css == BasicViewHelperData.TEXT_MARKER).length > 0);
        texts.forEach(text => this.resizeText(<Text>text));
    }

    private zoomWarshipPolygons() {
        if (this.zoomLevel <= 1) {
            return;
        }

        const fleetGroups = this.canvas!.children().filter(c => c.id().startsWith(BasicViewHelperData.FLEET_SHARK_SELECTOR_ID_PREFIX) && c.id().endsWith(BasicViewHelperData.GROUP_SELECTOR_SUFFIX));
        // todo zoom it
    }

    private zoomFleetGroups() {
        if (this.zoomLevel <= 1) {
            return;
        }

        this.clearRestrictedAreas();

        const fleetGroups = this.canvas!.children().filter(c => c.id().startsWith(BasicViewHelperData.FLEET_SHARK_SELECTOR_ID_PREFIX) && c.id().endsWith(BasicViewHelperData.GROUP_SELECTOR_SUFFIX));
        const polygons: Element[] = [];
        fleetGroups.forEach(g => g.children().filter(c => c.classes().filter(css => css == BasicViewHelperData.FLEET_SHARK_POLYGON_MARKER).length > 0).forEach(polygon => polygons.push(polygon)));
        polygons.forEach(elem => {
            const polygon = <Polygon>elem;
            let x;
            let y;
            let orbit;
            const orbitClasses = polygon.classes().filter(css => css.startsWith(BasicViewHelperData.ORBIT_ID_MARKER));
            if (orbitClasses.length > 0) {
                const orbitId = orbitClasses[0].replace(BasicViewHelperData.ORBIT_ID_MARKER, '');
                orbit = this.getOrbitOfCelestialByID(orbitId)!;
                if (!orbit) {
                    const fleet = this.getFleetByID(polygon.id());
                    if (!!fleet && !!fleet.orbit) {
                        // a virtual orbit is set for fleets in motion
                        orbit = fleet.orbit.orbit!;
                    }
                }
                //x = this.convertToStandardMetric(orbit.xCoordinate);
                //y = this.convertToStandardMetric(orbit.yCoordinate);
                x = orbit.xCoordinate.coordinate;
                y = orbit.yCoordinate.coordinate;
            } else {
                const center = this.getCoordsFromCenterMarker(polygon);
                if (!!center) {
                    x = center[0];
                    y = center[1];
                }
            }

            if (!!x && !!y) {
                let points;
                if (!!orbit) {
                    points = this.createFleetSharkPoints(x, y, orbit, this.zoomLevel);
                } else {
                    points = this.defineFleetSharkPoints(x, y, this.zoomLevel);
                }

                polygon.plot(points);
                polygon.stroke(this.zoomStroke(BasicViewHelper.STROKE_BLACK));
            }
        });
    }

    private zoomStateDots() {
        if (this.zoomLevel <= 1) {
            return;
        }

        const fleetGroups = this.canvas!.children().filter(c => c.id().startsWith(BasicViewHelperData.FLEET_SHARK_MARKER));
        const stateDots: Circle[] = [];
        fleetGroups.forEach(g => {
            g.children().forEach(c => {
                const isStateDot = c.classes().filter(css => css.startsWith(BasicViewHelperData.MOVABLE_STATE_DOT_MARKER)).length > 0;
                if (isStateDot && c instanceof Circle) {
                    stateDots.push(c);
                }
            });
        });
        stateDots.forEach(dot => {
            const cssClass = dot.classes().filter(css => css.startsWith(BasicViewHelperData.ICON_ID_MARKER));
            const id = cssClass![0].replace(BasicViewHelperData.ICON_ID_MARKER, '');
            const fleetShark: Polygon | undefined = this.getFleetSharkByID(id);
            if (!!fleetShark) {
                const {sortedPointsX, sortedPointsY} = this.sortPoints(fleetShark.array());
                let x = sortedPointsX[0][0];
                let y = sortedPointsY[sortedPointsY.length - 1][1];
                const radius = BasicViewHelper.STATE_DOT_RADIUS / (this.zoomLevel * 1.6);
                x -= radius;
                y -= radius;
                dot.radius(radius).x(x).y(y).stroke(this.zoomStroke(BasicViewHelper.STROKE_BLACK));
            }
        });
    }

    private zoomCyclingCircles() {
        if (this.zoomLevel <= 1) {
            return;
        }

        const circles: Element[] = this.canvas!.children().filter(elem => elem.id().endsWith(BasicViewHelperData.CYCLING_CIRCLE_SUFFIX));
        circles.forEach(dot => {
            if (dot instanceof Circle) {
                const cssClass = dot.classes().filter(css => css.startsWith(BasicViewHelperData.ICON_ID_MARKER));
                const id = cssClass![0].replace(BasicViewHelperData.ICON_ID_MARKER, '');
                const isInvisible = dot.classes().filter(css => css === BasicViewHelper.INVISIBLE_CLASS).length > 0;
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
        const elements = drawingGroup.children().filter(c => c.classes().filter(c => c == BasicViewHelperData.RESIZE_ON_ZOOM_MARKER).length != 0);
        elements!.forEach(c => {
            if ('radius' in c) {
                this.resizeCelestial(c);
            }
            if (c.classes().filter(c => c == BasicViewHelperData.ROUND_CAP_MARKER).length != 0) {
                this.repositioningRoundCapMarker(c);
            }
            if (c.classes().filter(c => c == BasicViewHelperData.WORMHOLE_MARKER).length != 0) {
                c.stroke(this.zoomStroke({width: 1, color: 'irrelevant'}));
            }
        });
    }

    protected getOrCreateMainCelestialGroup() {
        const mainGroups = this.canvas!.children().filter(c => c.id() === BasicViewHelperData.CELESTIAL_MAIN_GROUP);
        if (mainGroups.length > 0) {
            return <G>mainGroups[0]!;
        } else {
            return this.canvas!.group().id(BasicViewHelperData.CELESTIAL_MAIN_GROUP);
        }
    }

    private repositioningRoundCapMarker(c: Element) {
        const path = <Path>c;
        const center = this.getCoordsFromCenterMarker(path);
        if (!!center) {
            const x = center[0];
            const y = center[1];
            let xShifter = undefined;
            let yShifter = undefined;
            if (this.zoomLevel > 1) {
                xShifter = BasicViewHelper.ROUND_CAP_MARKER_X_PIXEL_SHIFT / this.zoomLevel;
                yShifter = BasicViewHelper.ROUND_CAP_MARKER_Y_PIXEL_SHIFT / this.zoomLevel;
            }
            let arr = this.createRoundCapMarkerNorthPoints(x, y, xShifter, yShifter);
            path.plot(arr)
        }
    }

    private resizeCelestial(c: Element) {
        let baseRadius = BasicViewHelper.PLANET_RADIUS;
        const isStar = c.classes().filter(c => c == BasicViewHelperData.STAR_MARKER).length != 0;
        if (isStar) {
            baseRadius = BasicViewHelper.STAR_RADIUS;
        }
        const isStarInSystem = c.classes().filter(c => c == BasicViewHelperData.STAR_IN_SYSTEM_MARKER).length != 0;
        if (isStarInSystem) {
            baseRadius = BasicViewHelper.STAR_RADIUS_IN_SYSTEM;
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

    protected drawCelestial(orbitDefinition: OrbitDefinition) {
        let mainGroup = this.getOrCreateMainCelestialGroup();

        const orbit: Orbit = orbitDefinition.orbit;
        let orbitID = this.getOrbitID(orbit);
        let celestialBodyID = this.getCelestialBodyID(orbit);
        this.setOrbitById(orbitID, orbit);

        const x = this.convertToStandardMetric(orbit.xCoordinate);
        const y = this.convertToStandardMetric(orbit.yCoordinate);
        if (orbitDefinition.isColonizable) {
            // to rotate around the center just flip the + and -
            this.createRoundCapMarkerNorth(mainGroup, celestialBodyID, x, y);
        }

        const circle = mainGroup.circle()
            .x(x)
            .y(y)
            .id(celestialBodyID)
            .addClass(BasicViewHelper.CLICKABLE_CSS_CLASS);

        if (this.isInterstellarViewHelper()) {
            circle.addClass(BasicViewHelperData.RESIZE_ON_ZOOM_MARKER);
        }

        if ('idPlanet' in orbitDefinition.celestial) {
            circle.addClass("planet");
            circle.radius(BasicViewHelper.PLANET_RADIUS);
        } else {
            circle.addClass(BasicViewHelperData.STAR_MARKER);
            circle.addClass(BasicViewHelperData.STAR_COLOR_MARKER);
            circle.radius(BasicViewHelper.STAR_RADIUS);
        }

        if (orbitDefinition.isColonizedByLoggedInUser) {
            circle.addClass(BasicViewHelper.IS_COLONIZED_BY_USER_COLOR_CSS_CLASS);
        } else if (orbitDefinition.isColonizedByOtherUser) {
            circle.addClass(BasicViewHelper.COLONIZED_BY_OTHERS_COLOR_CSS_CLASS);
        } else if (orbitDefinition.isNpc) {
            circle.addClass(BasicViewHelper.COLONIZED_BY_NPC_COLOR_CSS_CLASS);
        } else {
            circle.addClass(BasicViewHelper.NOT_COLONIZED_COLOR_CSS_CLASS);
        }

        if (!!orbitDefinition.color) {
            // if there is a color, we are at the external map, it's ugly, I know
            circle.fill(orbitDefinition.color);
            circle.removeClass(BasicViewHelperData.STAR_COLOR_MARKER);
            circle.removeClass(BasicViewHelper.IS_COLONIZED_BY_USER_COLOR_CSS_CLASS);
            circle.removeClass(BasicViewHelper.COLONIZED_BY_OTHERS_COLOR_CSS_CLASS);
            circle.removeClass(BasicViewHelper.COLONIZED_BY_NPC_COLOR_CSS_CLASS);
            circle.removeClass(BasicViewHelper.NOT_COLONIZED_COLOR_CSS_CLASS);
        }

        this.setCelestialCircleById(celestialBodyID, circle);
        this.setCelestialOrbitById(celestialBodyID, orbit);
        this.setCelestialObjectById(orbitID, orbitDefinition.celestial);
        this.setCelestialObjectById(celestialBodyID, orbitDefinition.celestial);

        let text: Text = new Text()
            .addClass(BasicViewHelperData.TEXT_MARKER)
            .addClass(BasicViewHelperData.ICON_ID_MARKER + celestialBodyID)
            .text(orbitDefinition.name)
            .x(circle.cx() + 10)
            .y(circle.cy() - 20);

        this.setTextOptions(text);

        if (!orbitDefinition.isColonizedByLoggedInUser && !orbitDefinition.isColonizedByOtherUser && !orbitDefinition.isNpc) {
            // add only texts which must be switched
            this.setTextById(orbitID, text);
        } else {
            // display constantly
            mainGroup.add(text);
        }
    }

    createRoundCapMarkerNorth(mainGroup: G, id: string, x: number, y: number, xShifter?: number, yShifter?: number) {
        let arr = this.createRoundCapMarkerNorthPoints(x, y, xShifter, yShifter);
        mainGroup.path(arr)
            .fill(BasicViewHelper.NONE_FILL_COLOR)
            .id(id + BasicViewHelperData.ROUND_CAP_SUFFIX)
            .addClass(BasicViewHelper.COLONIZABLE_SYSTEM_MARKER_CSS_CLASS)
            .addClass(BasicViewHelperData.RESIZE_ON_ZOOM_MARKER)
            .addClass(BasicViewHelperData.ROUND_CAP_MARKER)
            .addClass(this.getCenterMarker(x, y));
    }

    private getCenterMarker(x: number, y: number) {
        return BasicViewHelperData.CENTER_COORDINATES_MARKER + x + BasicViewHelperData.CENTER_COORDINATES_SEPARATOR + y;
    }

    private getCoordsFromCenterMarker(element: Element): ArrayXY | undefined {
        const markers = element.classes().filter(c => c.startsWith(BasicViewHelperData.CENTER_COORDINATES_MARKER));
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
            xShifter = BasicViewHelper.ROUND_CAP_MARKER_X_PIXEL_SHIFT;
        }
        if (!yShifter) {
            yShifter = BasicViewHelper.ROUND_CAP_MARKER_Y_PIXEL_SHIFT;
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
        const split = cssClass.replace(BasicViewHelperData.CENTER_COORDINATES_MARKER, '').split(BasicViewHelperData.CENTER_COORDINATES_SEPARATOR);
        if (!split) {
            return undefined;
        }
        const x = split[0];
        const y = split[1];
        return [Number.parseFloat(x), Number.parseFloat(y)];
    }

    private clickEventForCelestial = (event: PointerEvent) => {
        let id = this.getIdFromEvent(event);
        if (!this.isCelestialId(id)) {
            return;
        }
        if (!this.starMapCommService.isStarSystemDisplayed() && !this.starMapCommService.isSelectedFleetMarker()) {
            let orbitByID = this.getOrbitOfCelestialByEvent(event);
            if (!!orbitByID) {
                let system = this.getKnownStarSystemByOrbit(orbitByID);
                if (!!system) {
                    this.starMapCommService.displaySystem(system);
                }
                // if only a system is clicked, open it
                return;
            }
        }

        const celestialCircle = this.getCelestialByEvent(event);
        if (!celestialCircle) {
            return;
        }
        let x = celestialCircle.cx();
        let y = celestialCircle.cy();
        const celestial = this.getCelestialObjectByID(id);
        if (!celestial) {
            return;
        }
        if ('idPlanet' in celestial && 'idStarSystem' in celestial) {
            this.handleClickedPlanet(celestial, x, y, id);
        }
        if ('idStarSystem' in celestial && !('idPlanet' in celestial)) {
            this.handleClickedStarSystem(<StarSystem>celestial, x, y, id);
        }
    };

    private handleClickedStarSystem(celestial: StarSystem, x: number, y: number, id: string) {
        const isSelected = this.starMapCommService.isSelectedStarSystem();
        const selectionAlreadySelected = this.starMapCommService.isSelectedStarSystem(celestial.idStarSystem);
        if (selectionAlreadySelected) {
            this.removeCyclingCircle(id);
            this.starMapCommService.removeSelectedStarSystem();
            return;
        }
        if (isSelected && !selectionAlreadySelected) {
            const celestial = this.starMapCommService.selectedStarSystem;
            const celestialBodyID = this.getCelestialBodyID(celestial!.orbit!);
            this.removeCyclingCircle(celestialBodyID);
            this.starMapCommService.removeSelectedStarSystem();
        }
        // add selected system
        this.drawCyclingCircle(x, y, id, false);
        this.starMapCommService.setSelectedStarSystem(celestial);
    }

    private handleClickedPlanet(celestial: Planet, x: number, y: number, id: string) {
        const isSelected = this.starMapCommService.isSelectedPlanet();
        const selectionAlreadySelected = this.starMapCommService.isSelectedPlanet(celestial.idPlanet);
        if (selectionAlreadySelected) {
            this.removeCyclingCircle(id);
            this.starMapCommService.removeSelectedPlanet();
            return;
        }
        if (isSelected && !selectionAlreadySelected) {
            const celestial = this.starMapCommService.selectedPlanet;
            const celestialBodyID = this.getCelestialBodyID(celestial!.orbit!);
            this.removeCyclingCircle(celestialBodyID);
            this.starMapCommService.removeSelectedPlanet();
        }
        // add selected system
        this.drawCyclingCircle(x, y, id, false);
        this.starMapCommService.setSelectedPlanet(celestial);
    }

    private clickEventForFleetGroup = (event: PointerEvent) => {
        if (!this.isFleetSharkId(this.getIdFromEvent(event))) {
            return;
        }
        const clickedFleet = this.handleClickedFleet(event);
        this.drawCyclingCirclesForFleetsOnClick(clickedFleet);
        this.drawMovePathOnClick();
    };

    private handleClickedFleet(event: PointerEvent): FleetMarker | undefined {
        let fleetMarker = this.getFleetByEvent(event);
        this.doFleetMarkerSelection(fleetMarker);
        return fleetMarker;
    }

    private drawCyclingCirclesForFleetsOnClick(clickedFleet: FleetMarker | undefined) {
        if (!!clickedFleet) {
            const fleetSharkID = this.getFleetSharkID(clickedFleet);
            let fleetShark: G = this.getGroupById(fleetSharkID)!;
            const id = fleetShark.id();
            const cyclingCircleId = this.getCyclingCircleId(id);
            let cyclingCircles = this.canvas!.children().filter(value => value.id() === cyclingCircleId);
            if (cyclingCircles.length == 0) {
                const isInvisible = fleetShark.classes().filter(css => css == BasicViewHelper.INVISIBLE_CLASS).length > 0;
                this.drawCyclingCircle(fleetShark.cx(), fleetShark.cy(), id, isInvisible);
            } else {
                this.removeCyclingCircle(id);
            }
        }
    }

    // noinspection JSUnusedLocalSymbols
    private getRadius(element: Element, zoomFactor: number) {
        const box = element.bbox();
        let diameter = Math.ceil(Math.sqrt(Math.pow(Math.ceil(box.width), 2) + Math.pow(Math.ceil(box.height), 2)));

        const linkedElements = this.canvas!.children()
            .filter(c => c.id().startsWith(element.id()))
            .filter(c => !c.id().endsWith(BasicViewHelperData.ORBIT_SUFFIX));
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

    private drawMovePathOnClick() {
        const selectedFleetMarker = this.starMapCommService.getSelectedFleetMarker();
        // add
        this.starMapCommService.getMovingFleetMarker().forEach(fm => {
            const fleetSharkID = this.getFleetSharkID(fm);
            const movePaths = this.canvas!.children().filter(c => c.id() === fleetSharkID + BasicViewHelperData.MOVE_SUFFIX);
            if (movePaths.length == 0) {
                this.displayMovePath(fm);
            }
        });
        // remove
        const movePaths = this.canvas!.children().filter(c => c.id().endsWith(BasicViewHelperData.MOVE_SUFFIX));
        movePaths.forEach(mp => {
            const sanitizedID = mp.id().replace(BasicViewHelperData.MOVE_SUFFIX, '');
            const withDisplayedMove = this.getFleetByID(sanitizedID);
            if (!!withDisplayedMove && selectedFleetMarker.filter(fm => fm.fleet.id == withDisplayedMove.fleet.id).length == 0) {
                this.canvas!.removeElement(mp);
            }
        });
    }

    private doFleetMarkerSelection(fleetMarker: FleetMarker | undefined) {
        if (!!fleetMarker) {
            if (this.starMapCommService.isSelectedFleetMarker(fleetMarker.fleet.id)) {
                this.starMapCommService.removeSelectedFleetMarker(fleetMarker);
            } else {
                this.starMapCommService.addFleetMarker(fleetMarker);
            }
        }
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

    private drawCyclingCircle(x: number, y: number, id: string, isInvisible: boolean) {
        const zoomFactor = this.getOrDefaultZoomFactor(this.zoomLevel);

        const elementToParent = this.findElementAndParentById(id);
        let parent: Dom = elementToParent.parent;
        let element: Element | undefined = elementToParent.element;
        if (!!element) {
            const radius = this.getRadius(element, zoomFactor);
            const circle = new Circle().x(x).y(y)
                .radius(radius)
                .stroke(this.zoomStroke(BasicViewHelper.STROKE_CYCLING_CIRCLE))
                .addClass(BasicViewHelper.CYCLING_CIRCLE_MARKER)
                .addClass(BasicViewHelper.CLICKABLE_CSS_CLASS)
                .addClass(BasicViewHelperData.ICON_ID_MARKER + id)
                .id(this.getCyclingCircleId(id));

            if (isInvisible) {
                circle.addClass(BasicViewHelper.INVISIBLE_CLASS);
            }

            parent.removeElement(element);
            parent.add(circle);
            parent.add(element);
        }
    }

    private removeCyclingCircle(id: string) {
        if (!id.endsWith(BasicViewHelperData.CYCLING_CIRCLE_SUFFIX)) {
            id = this.getCyclingCircleId(id);
        }

        const elementToParent = this.findElementAndParentById(id);
        let parent: Dom = elementToParent.parent;
        let element: Element | undefined = elementToParent.element;
        if (!!element) {
            parent.removeElement(element);
        }
    }

    // noinspection JSUnusedLocalSymbols
    private getStarSystemByEvent = (event: PointerEvent): StarSystem | undefined => {
        let orbitByID = this.getOrbitOfCelestialByEvent(event);
        if (!!orbitByID) {
            return this.getKnownStarSystemByOrbit(orbitByID);
        }
        return undefined;
    };

    // noinspection JSUnusedLocalSymbols
    private getPlanetByEvent = (event: PointerEvent): Planet | undefined => {
        let orbitByID = this.getOrbitOfCelestialByEvent(event);
        if (!!orbitByID) {
            return this.getPlanetByOrbit(orbitByID);
        }
        return undefined;
    };

    mouseoverForText = (event: PointerEvent) => {
        const text = this.getTextByEvent(event);
        if (!!text) {
            this.resizeText(text);
            this.canvas?.add(text)
        }
    }

    private resizeText(text: Text) { // todo text positioned false the first time - why?
        const idMarker = text.classes().filter(css => css.startsWith(BasicViewHelperData.ICON_ID_MARKER));
        if (idMarker.length > 0) {
            const id = idMarker[0].replace(BasicViewHelperData.ICON_ID_MARKER, '');
            const fleetShark: Polygon | undefined = this.getFleetSharkByID(id);
            const celestial: Circle | undefined = this.getCelestialByID(id);
            let x = undefined;
            let y = undefined;
            if (!!celestial) {
                x = celestial.cx() + (10 / this.zoomLevel);
                y = celestial.cy() - (20 / this.zoomLevel);
            } else if (!!fleetShark) {
                const {sortedPointsX, sortedPointsY} = this.sortPoints(fleetShark.array());
                let xMarker = sortedPointsX[0];
                let yMarker = sortedPointsY[sortedPointsY.length - 1];
                x = xMarker[0] + (2.5 / this.zoomLevel);
                y = yMarker[1] - (2.5 / this.zoomLevel);
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

    protected setOrbits(orbits: OrbitDefinition[]) {
        super.setOrbits(orbits);
        this.createPolarCoordinateSystem();
    }

    private createPolarCoordinateSystem() {
        let {x, y} = this.getWidestExpanse();
        this.radiusOfCoordinateCross = BasicViewHelper.calculateDistance(x, y);
        this.radiusOfCoordinateCross *= 1.1;

        this.createLocalPolarCoordinateSystem(0, 0, this.radiusOfCoordinateCross, 'main');
    }

    protected createLocalPolarCoordinateSystem(xBase: number, yBase: number, radius: number, idPrefix: string) {
        let mainGroup = this.getOrCreateMainCelestialGroup();
        const group = mainGroup.group().id(idPrefix + "-" + BasicViewHelper.COORD_CROSS);
        let steps = 6;
        const radiusSteps = radius / steps;
        for (let i = 1; i < steps; i++) {
            group.circle()
                .x(xBase)
                .y(yBase)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .id(idPrefix + "-" + BasicViewHelper.COORD_CROSS + i)
                .addClass(this.externalMapPrefix + BasicViewHelper.COORD_CROSS)
                .radius(radiusSteps * i);
        }
        const degree = 12;
        for (let j = 1; j <= 30; j++) {
            const angle = j * degree;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const points: ArrayXY[] = [[xBase, yBase], [xBase + x, yBase + y]];
            group.line(points)
                .id(idPrefix + "-" + BasicViewHelper.COORD_CROSS + "-line" + j)
                .addClass(this.externalMapPrefix + BasicViewHelper.COORD_CROSS)
        }
    }

    // noinspection JSUnusedGlobalSymbols
    protected drawResonanceZone(xBase: number, yBase: number, radius: number) {
        // todo some kind of art - could be accidentally very useful for wormhole junction resonance zones
        let steps = 6;
        const radiusSteps = radius / steps;
        for (let i = 0; i < steps; i++) {
            this.canvas!
                .circle()
                .x(xBase)
                .y(yBase)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .id("coordCross" + i)
                .addClass("coordCross")
                .radius(radiusSteps * i);
        }
        const degree = 12;
        for (let j = 1; j <= 30; j++) {
            const angle = j * degree;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const points: ArrayXY[] = [[xBase, yBase], [x, y]];
            this.canvas!
                .line(points)
                .addClass("coordCross")
        }
    }

    // noinspection JSUnusedGlobalSymbols
    protected createCoordinateSystem(xBase: number, yBase: number, radius: number, idPrefix: string) {
        // y-axis
        // x-axis
        this.drawAxis(xBase, yBase, radius, idPrefix);
        // y-axis tick marks
        // x-axis tick marks
        this.drawTickMarks(xBase, yBase, radius, idPrefix);
    }


    /**
     * draws the tick marks for the axis
     *
     * @param xBase the base x coord
     * @param yBase the base y coord
     * @param radius the maximum radius
     * @param idPrefix the css selector prefix
     * @private
     */
    private drawTickMarks(xBase: number, yBase: number, radius: number, idPrefix: string) {
        let p: number[] = [];
        let diff: number = radius / 2;
        let step: number = diff / 10;
        let xRunnerUpper: number = xBase;
        let xRunnerLower: number = xBase;
        let yRunnerUpper: number = yBase;
        let yRunnerLower: number = yBase;
        for (let i = 0; i <= 20; i++) {
            if (i == 0) {
                xRunnerUpper += step;
                xRunnerLower -= step;
                yRunnerUpper += step;
                yRunnerLower -= step;
                continue;
            }
            let width = step;
            if (i % 10 == 0) {
                width = step * 2;
            } else if (i % 5 == 0) {
                width = step;
            } else {
                width = step / 2;
            }
            p = [];
            p.push(xBase + width, yRunnerUpper);
            p.push(xBase - width, yRunnerUpper);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "y-" + i);
            p = [];
            p.push(xBase + width, yRunnerLower);
            p.push(xBase - width, yRunnerLower);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "y-" + i);
            p = [];
            p.push(xRunnerUpper, yBase + width);
            p.push(xRunnerUpper, yBase - width);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "x-" + i);
            p = [];
            p.push(xRunnerLower, yBase + width);
            p.push(xRunnerLower, yBase - width);
            this.canvas!.line(p).addClass("coordCross").id(idPrefix + "x-" + i);
            xRunnerUpper += step;
            xRunnerLower -= step;
            yRunnerUpper += step;
            yRunnerLower -= step;
        }
    }

    /**
     * draws the axis
     *
     * @param xBase the base x coord
     * @param yBase the base y coord
     * @param radius the maximum radius
     * @param idPrefix the css selector prefix
     * @private
     */
    private drawAxis(xBase: number, yBase: number, radius: number, idPrefix: string) {
        let p: number[] = [];
        p.push(xBase, yBase + radius);
        p.push(xBase, yBase + radius * -1);
        this.canvas!.line(p).addClass("coordCross").id(idPrefix + "-x");
        p = []
        p.push(xBase + radius, yBase);
        p.push(xBase + radius * -1, yBase);
        this.canvas!.line(p).addClass("coordCross").id(idPrefix + "-y");
    }

    /**
     * returns the view box string for the svg
     */
    public setViewBox(orbit: Orbit | undefined, factor: number) {
        let viewBoxDef: string = "0 0 0 0";
        if (!!this.radiusOfCoordinateCross) {
            let width = this.radiusOfCoordinateCross! * factor;
            let height = this.radiusOfCoordinateCross! * factor;
            let startX = -width;
            let startY = -height / this.aspectRatio;

            let xOffset = 0;
            let yOffset = 0;
            if (!!orbit) {
                xOffset = this.convertToStandardMetric(orbit?.xCoordinate);
                yOffset = this.convertToStandardMetric(orbit?.yCoordinate)
            }

            viewBoxDef = (startX + xOffset) + " " + (startY + yOffset) + " " + width * 2 + " " + height * 2;
        }
        this.canvas!.viewbox(viewBoxDef);
    }

    calculateDistanceOfOrbits(firstOrbit: Orbit, secondOrbit: Orbit): number {
        return NavigationCalculator.calculateDistanceOfOrbits(firstOrbit, secondOrbit, this.standardDistanceMetric);
    }

    protected createFleetGroup(fleetMarker: FleetMarker, x: number, y: number, orbit: Orbit): G {

        let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);
        const userIsOwner = fleetMarker.owner.id == this.userId;
        let fleetSharkID = this.getFleetSharkID(fleetMarker);

        this.setFleetById(fleetSharkID, fleetMarker);

        let group = this.canvas!.group().id(fleetSharkID + BasicViewHelperData.GROUP_SELECTOR_SUFFIX);
        this.setGroupById(fleetSharkID + BasicViewHelperData.GROUP_SELECTOR_SUFFIX, group);

        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (userIsOwner) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }

        const fleetShark = group
            .polygon(fleetSharkPoints)
            .fill(fleetSharkColor)
            .stroke(BasicViewHelper.STROKE_BLACK)
            .addClass(BasicViewHelperData.FLEET_SHARK_POLYGON_MARKER)
            .addClass(BasicViewHelperData.CLICKABLE_CSS_CLASS)
            .id(fleetSharkID);

        if (!!orbit) {
            const orbitID = this.getOrbitID(orbit);
            fleetShark.addClass(BasicViewHelperData.ORBIT_ID_MARKER + orbitID);
        }
        fleetShark.addClass(this.getCenterMarker(x, y));

        this.setFleetPolygonById(fleetSharkID, fleetShark);

        let {sortedPointsX, sortedPointsY} = this.sortPoints(fleetSharkPoints);

        this.displayFleetStates(!!fleetMarker.move, fleetMarker.state, sortedPointsX, sortedPointsY, group, fleetSharkID);

        let {xText, yText} = this.getUpperRightCornerPosition(sortedPointsX, sortedPointsY);

        let fleetSharkText: string = fleetMarker.name
        if (fleetMarker.owner.id != this.userId) {
            fleetSharkText += " of " + fleetMarker.owner.name;
        }

        let text: Text = new Text()
            .addClass(BasicViewHelperData.TEXT_MARKER)
            .addClass(BasicViewHelperData.ICON_ID_MARKER + fleetSharkID)
            .text(fleetSharkText)
            .x(xText[0])
            .y(yText[1]);

        this.setTextOptions(text);

        this.canvas?.add(group);
        this.setTextById(fleetSharkID, text);
        this.setFleetTextByMarker(text, fleetMarker);
        return group;
    }

    protected enrichWithVirtualOrbit(pointAt: { x: number; y: number }, fleetMarker: FleetMarker) {
        const orbit: Orbit = {
            xCoordinate: {
                coordinate: pointAt.x,
                distanceMetric: this.STANDARD_METRIC
            },
            yCoordinate: {
                coordinate: pointAt.y,
                distanceMetric: this.STANDARD_METRIC
            }
        }
        if (!fleetMarker.orbit) {
            fleetMarker.orbit = {};
        }
        fleetMarker.orbit.orbit = orbit;
    }

    protected drawFleets(fleetMarkers: FleetMarker[]) {

        this.clearFleets();
        fleetMarkers.forEach(fleetMarker => {
            let orbit = this.getOrbitFromFleetMarker(fleetMarker);
            const x = this.convertToStandardMetric(orbit.xCoordinate);
            const y = this.convertToStandardMetric(orbit.yCoordinate);
            this.createFleetGroup(fleetMarker, x, y, orbit);
        });
    }

    private getOrbitFromFleetMarker(fleetMarker: FleetMarker): Orbit {
        if (!!fleetMarker.move) {
            return fleetMarker.orbit!.orbit!;
        } else {
            if (this.isInterstellarViewHelper()) {
                return fleetMarker.orbit!.system!.orbit!;
            } else {
                return fleetMarker.orbit!.orbit!;
            }
        }
    }

    protected isInterstellarViewHelper() {
        return this.STANDARD_METRIC === DistanceMetricEnum.LY;
    }

    protected createStellarCoursePlot(move: Move): LineCommand[] {
        if (!move.startOrbit.orbit || !move.targetOrbit.orbit) {
            throw new Error("The move should have a origin and a destination.");
        }
        const xOrigin = move.startOrbit.orbit.xCoordinate;
        const yOrigin = move.startOrbit.orbit.yCoordinate;
        const xDestination = move.targetOrbit.orbit.xCoordinate;
        const yDestination = move.targetOrbit.orbit.yCoordinate;

        return this.createCoursePlot(xOrigin, yOrigin, xDestination, yDestination);
    }

    protected createInterstellarCoursePlot(move: Move): LineCommand[] {
        if (!move.startOrbit.orbit || !move.startOrbit.system || !move.targetOrbit.orbit || !move.targetOrbit.system) {
            throw new Error("The move should have a origin and a destination.");
        }

        const xOrigin = move.startOrbit.system.orbit.xCoordinate;
        const yOrigin = move.startOrbit.system.orbit.yCoordinate;
        const xDestination = move.targetOrbit.system.orbit.xCoordinate;
        const yDestination = move.targetOrbit.system.orbit.yCoordinate;

        return this.createCoursePlot(xOrigin, yOrigin, xDestination, yDestination);
    }

    protected createCoursePlot(xOrigin: Distance, yOrigin: Distance, xDestination: Distance, yDestination: Distance): LineCommand[] {
        let startX: number = this.convertToStandardMetric(xOrigin);
        let startY: number = this.convertToStandardMetric(yOrigin);

        let endX: number = this.convertToStandardMetric(xDestination);
        let endY: number = this.convertToStandardMetric(yDestination);

        let p1: LineCommand = ["M", startX, startY];
        let p2: LineCommand = ["L", endX, endY];

        return [p1, p2];
    }

    protected calculatePositionOnTrack(startOrbit: Orbit, targetOrbit: Orbit, fleetMarker: FleetMarker, arr: LineCommand[]) {
        let distance = this.calculateDistanceOfOrbits(startOrbit, targetOrbit);
        let part = (fleetMarker.move!.originalDuration - fleetMarker.move!.moveDoneAtZero) / fleetMarker.move!.originalDuration;
        if (part < 0.1) {
            part = 0.1;
        } else if (part > 0.9) {
            part = 0.9;
        }
        let coveredTrackLength = distance * part;
        return new Path().plot(arr).pointAt(coveredTrackLength);
    }

    protected displayMovePath(fleetMarker: FleetMarker) {
        if (!fleetMarker.move) {
            return;
        }

        let fleetSharkId = this.getFleetSharkID(fleetMarker);
        let startOrbit = fleetMarker.move!.startOrbit.system!.orbit;
        let targetOrbit = fleetMarker.move!.targetOrbit.system!.orbit;
        const isSameSystem = fleetMarker.move!.startOrbit.system!.idStarSystem === fleetMarker.move!.targetOrbit.system!.idStarSystem;
        if (isSameSystem) {
            startOrbit = fleetMarker.move!.startOrbit.orbit!;
            targetOrbit = fleetMarker.move!.targetOrbit.orbit!;
        }
        const xStart = this.convertToStandardMetric(startOrbit.xCoordinate);
        const yStart = this.convertToStandardMetric(startOrbit.yCoordinate);
        const xEnd = this.convertToStandardMetric(targetOrbit.xCoordinate);
        const yEnd = this.convertToStandardMetric(targetOrbit.yCoordinate);

        const distance = NavigationCalculator.calculateDistanceOfPoints([xStart, yStart], [xEnd, yEnd]);

        let angle = NavigationCalculator.getRestrictedAngle(xStart, yStart, xEnd, yEnd);

        const runner: G = new G()
            .group()
            .addClass('coursePlot')
            .id(fleetSharkId + BasicViewHelperData.MOVE_SUFFIX);

        const pitch = Math.tan(NavigationCalculator.toRad(angle));
        for (let i = 0; i < Math.ceil(distance / 200); i++) {
            const xOffset = i * 10;
            const yOffset = pitch * xOffset;
            let p1: ArrayXY = [xOffset + xStart, yOffset + yStart + 10];
            let p2: ArrayXY = [xOffset + xStart + 20, yOffset + yStart + 10];
            let p3: ArrayXY = [xOffset + xStart + 10, yOffset + yStart];

            p2 = NavigationCalculator.rotatePoint(p1, angle + 90, p2);
            p3 = NavigationCalculator.rotatePoint(p1, angle + 90, p3);
            runner.polygon([p1, p2, p3])
        }

        runner.animate({
            duration: 2000 * (distance / 100),
            delay: 1000,
            when: 'now',
            swing: false,
            times: 50000,
            wait: 200
        }).transform({
            positionX: xEnd,
            positionY: yEnd
        });
        this.canvas!.add(runner);
    }

    protected displayFleetStates(onMove: boolean, state: StateBlock, sortedPointsX: ArrayXY[], sortedPointsY: ArrayXY[], group: G | undefined, fleetSharkID: string) {

        let txt;
        const cssClasses: string[] = [];
        if (onMove) {
            cssClasses.push('on-movement')
            txt = 'Fleet in at move';
        }
        if (!state.isActive) {
            if (state.needsRepair) {
                cssClasses.push('under-construction');
                txt = 'Fleet is in dock';
            }
            if (!state.isOperational) {
                cssClasses.push('inoperational');
                txt = 'Fleet is inoperational';
            }
        }

        if (!!txt) {
            const halfRadius = BasicViewHelper.STATE_DOT_RADIUS / 2;
            let xMarker = sortedPointsX[0];
            let yMarker = sortedPointsY[sortedPointsY.length - 1];

            group!.circle(BasicViewHelper.STATE_DOT_RADIUS)
                .stroke(BasicViewHelper.STROKE_BLACK)
                .addClass(BasicViewHelperData.MOVABLE_STATE_DOT_MARKER)
                .addClass(BasicViewHelperData.ICON_ID_MARKER + fleetSharkID)
                .x(xMarker[0] - halfRadius)
                .y(yMarker[1] - halfRadius)
                .id(fleetSharkID + BasicViewHelperData.MOVABLE_STATE_DOT_MARKER);

            cssClasses.forEach(c => group!.addClass(c));

            let text: Text = new Text()
                .addClass(BasicViewHelperData.TEXT_MARKER)
                .addClass(BasicViewHelperData.MOVABLE_STATE_DOT_MARKER)
                .addClass(BasicViewHelperData.ICON_ID_MARKER + fleetSharkID)
                .text(txt)
                .x(xMarker[0] - halfRadius)
                .y(yMarker[1] - halfRadius)
                .id(fleetSharkID + BasicViewHelperData.MOVABLE_STATE_DOT_MARKER + BasicViewHelperData.TEXT_MARKER);

            this.setTextOptions(text);

            this.setTextById(fleetSharkID + BasicViewHelperData.MOVABLE_STATE_DOT_MARKER, text);
        }
    }
}
