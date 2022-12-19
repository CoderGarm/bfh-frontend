import {Distance, FleetMarker, Move, Orbit, Planet, StarSystem} from "./services/swagger";
import {ArrayXY, Circle, CurveCommand, Element, G, LineCommand, Path, PathArrayAlias, Polygon, StrokeData, SVG, Svg, Text} from "@svgdotjs/svg.js";
import {RestrictedFleetArea} from "./modules/star-map/payload/restricted-fleet-area";
import {OrbitDefinition} from "./modules/star-map/payload/orbit-definition";
import {NavigationCalculator} from "./NavigationCalculator";
import {Component, HostListener} from "@angular/core";
import {StarMapCommunicationService} from "./star-map-communication.service";
import {AppInjector} from "./app.module";
import {TokenStorage} from "./services/authentication/token-storage.service";
import {NumberRomanPipe} from "./services/pipes/number-roman.pipe";
import {BasicViewHelperData} from "./basic-view-helper-data";
import DistanceMetricEnum = Distance.DistanceMetricEnum;


@Component({
    template: ''
})
export class BasicViewHelper extends BasicViewHelperData {

    starMapCommService = AppInjector.get(StarMapCommunicationService);
    romanPipe = AppInjector.get(NumberRomanPipe);

    public static readonly PAN_ZOOM_OPTIONS = {
        // https://github.com/svgdotjs/svg.panzoom.js/blob/master/readme.md
        zoomFactor: 0.3, // zooming per wheel tick
        zoomMin: 0.1, // zoom max out to display the full svg payload as 20% of the screen
        zoomMax: 4 // zoom max 4 times in
    };
    public readonly STANDARD_METRIC;

    protected tokenStorage: TokenStorage;

    constructor(tokenStorage: TokenStorage,
                standardDistanceMetric: DistanceMetricEnum) {
        super(standardDistanceMetric);

        this.tokenStorage = tokenStorage;
        this.STANDARD_METRIC = standardDistanceMetric;
        const sub = this.starMapCommService.getDeselectEverythingEmitter().subscribe(() => {
            const elements = this.canvas?.children().filter(elem => elem.id().endsWith(BasicViewHelper.CYCLING_CIRCLE_SUFFIX) || elem.id().endsWith(BasicViewHelper.MOVE_SUFFIX));
            if (!!elements && elements.length > 0) {
                elements.forEach(elem => this.canvas?.removeElement(elem));
            }
        });
        this.subscriptions.push(sub);
    }

    protected static readonly STROKE_BLACK: StrokeData = {color: "black", width: 1};
    // noinspection CssConvertColorToRgbInspection
    protected static readonly STROKE_CYCLING_CIRCLE: StrokeData = {color: "#B0B0B0", width: 3, dasharray: "15px"}; // $metal-glance in variables

    protected static readonly ROUND_CAP_MARKER_X_PIXEL_SHIFT: number = 9;
    protected static readonly ROUND_CAP_MARKER_Y_PIXEL_SHIFT: number = 8;
    protected static readonly STATE_DOT_RADIUS: number = 5;

    protected static readonly CYCLING_CIRCLE_MARKER = "circle-cycle";

    protected readonly FLEET_SHARK_COLOR_HOSTILE = "red";
    protected readonly FLEET_SHARK_COLOR_OWN = "green";
    protected readonly FLEET_COLLECTION_COLOR_MIXED = "purple";

    protected readonly COURSE_PLOT_COLOR_OUTBOUND: string = "green";
    protected readonly COURSE_PLOT_COLOR_INBOUND: string = "red";
    public static readonly NONE_FILL_COLOR = "none";

    protected static readonly NOT_COLONIZED_COLOR_CSS_CLASS = "not-colonized";
    protected static readonly IS_COLONIZED_BY_USER_COLOR_CSS_CLASS = "colonized-by-user";
    protected static readonly COLONIZED_BY_OTHERS_COLOR_CSS_CLASS = "colonized-by-others";
    protected static readonly COLONIZABLE_SYSTEM_MARKER_CSS_CLASS = "colonizable";

    protected static readonly PLANET_RADIUS = 5;
    protected static readonly CYCLING_CIRCLE_RADIUS = BasicViewHelper.PLANET_RADIUS * 3;
    protected static readonly STAR_RADIUS = 5;
    protected static readonly STAR_RADIUS_IN_SYSTEM = 15;

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

    clearData() {
        if (!!this.canvas) {
            // remove all elements from canvas a little bit more performant
            this.canvas.node.innerHTML = '';
            super.clearData();
        }
    }

    protected setCanvas(canvas: Svg) {
        if (!canvas) {
            throw new Error("The canvas isn't initialized.");
        } else {
            this.canvas = canvas;
        }
    }

    createCanvas(id: string, parentCssId: string): void {
        if (!this.canvas) {
            this.canvas = SVG().id(id).addTo(parentCssId).panZoom(BasicViewHelper.PAN_ZOOM_OPTIONS);
            this.canvas
                .on('zoom', this.zoomModification)
                .mouseover(this.mouseoverForText)
                .mouseout(this.mouseoutForText)
                .click(this.clickEventForCelestial)
                .click(this.clickEventForFleetGroup)
        }
    }

    private zoomModification = (ev: any) => {
        this.zoomLevel = ev.detail.level;
        this.zoomResizableContents();
        this.zoomFleetGroups();
        this.setVisibilityOfFleetGroups();
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
            .filter(c => c.classes().filter(css => css == BasicViewHelper.MOVABLE_STATE_DOT_MARKER).length == 0)
            .filter(c => c.classes().filter(css => css == BasicViewHelper.TEXT_MARKER).length > 0);
        texts.forEach(text => this.resizeText(<Text>text));
    }

    private zoomFleetGroups() {
        if (this.zoomLevel <= 1) {
            return;
        }

        this.clearRestrictedAreas();

        const fleetGroups = this.canvas!.children().filter(c => c.id().startsWith(BasicViewHelper.FLEET_SHARK_SELECTOR_ID_PREFIX) && c.id().endsWith(BasicViewHelper.GROUP_SELECTOR_SUFFIX));
        const polygons: Element[] = [];
        fleetGroups.forEach(g => g.children().filter(c => c.classes().filter(css => css == BasicViewHelper.FLEET_SHARK_POLYGON_MARKER).length > 0).forEach(polygon => polygons.push(polygon)));
        polygons.forEach(elem => {
            const polygon = <Polygon>elem;
            let x;
            let y;
            let orbit;
            const orbitClasses = polygon.classes().filter(css => css.startsWith(BasicViewHelper.ORBIT_ID_MARKER));
            if (orbitClasses.length > 0) {
                const orbitId = orbitClasses[0].replace(BasicViewHelper.ORBIT_ID_MARKER, '');
                orbit = this.getOrbitOfCelestialByID(orbitId)!;
                if (!orbit) {
                    const fleet = this.getFleetByID(polygon.id());
                    if (!!fleet && !!fleet.orbit) {
                        // a virtual orbit is set for fleets in motion
                        orbit = fleet.orbit.orbit!;
                    }
                }
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

        const fleetGroups = this.canvas!.children().filter(c => c.id().startsWith(BasicViewHelper.FLEET_SHARK_SELECTOR_ID_PREFIX));
        const stateDots: Circle[] = [];
        fleetGroups.forEach(g => {
            g.children().forEach(c => {
                const isStateDot = c.classes().filter(css => css.startsWith(BasicViewHelper.MOVABLE_STATE_DOT_MARKER)).length > 0;
                if (isStateDot && c instanceof Circle) {
                    stateDots.push(c);
                }
            });
        });
        stateDots.forEach(dot => {
            const cssClass = dot.classes().filter(css => css.startsWith(BasicViewHelper.ICON_ID_MARKER));
            const fleetSharkId = cssClass![0].replace(BasicViewHelper.ICON_ID_MARKER, '');
            const fleetShark: Polygon | undefined = this.getFleetSharkByID(fleetSharkId);
            if (!!fleetShark) {
                const {sortedPointsX, sortedPointsY} = this.sortPoints(fleetShark.array());
                let xMarker = sortedPointsX[0];
                let yMarker = sortedPointsY[sortedPointsY.length - 1];

                dot.radius(BasicViewHelper.STATE_DOT_RADIUS / (this.zoomLevel * 1.6))
                    .x(xMarker[0] - (2.5 / this.zoomLevel))
                    .y(yMarker[1] - (2.5 / this.zoomLevel));
                dot.stroke(this.zoomStroke(BasicViewHelper.STROKE_BLACK));
            }
        });
    }

    private zoomCyclingCircles() {
        if (this.zoomLevel <= 1) {
            return;
        }

        const circles: Element[] = this.canvas!.children().filter(elem => elem.id().endsWith(BasicViewHelper.CYCLING_CIRCLE_SUFFIX));
        circles.forEach(dot => {
            if (dot instanceof Circle) {
                const cssClass = dot.classes().filter(css => css.startsWith(BasicViewHelper.ICON_ID_MARKER));
                const id = cssClass![0].replace(BasicViewHelper.ICON_ID_MARKER, '');
                let x: number;
                let y: number;
                const fleetShark: Polygon | undefined = this.getFleetSharkByID(id);
                const celestial: Circle | undefined = this.getCelestialByID(id);
                let element: Element | undefined = !!fleetShark ? fleetShark : !!celestial ? celestial : undefined;
                if (!!element) {
                    x = element.cx();
                    y = element.cy();
                    this.canvas?.removeElement(dot)
                    this.drawCyclingCircle(x, y, id);
                }
            }
        });
    }

    private zoomStroke(strokeData: StrokeData) {
        const stroke = strokeData;
        const width = stroke.width! / this.zoomLevel;
        stroke.width = width < 0.3 ? 0.3 : width;
        if (!!stroke.dasharray) {
            let number = stroke.width * 3 < 4 ? 4 : stroke.width * 3;
            stroke.dasharray = (number / this.zoomLevel) + "px";
        }
        return stroke;
    }

    private setVisibilityOfFleetGroups() {
        const fleetCollectionGroups = this.canvas!.children().filter(c => c.id().startsWith(BasicViewHelper.FLEET_COLLECTION_SELECTOR_ID_PREFIX));
        const fleetSharkIDs: string[] = [];
        fleetCollectionGroups.map(fleetCollectionGroup => fleetCollectionGroup.id())
            .map(id => this.getFleetSharkIDsFromCollectionID(id)
                .forEach(id => fleetSharkIDs.push(id)));

        const fleetGroups: G[] = [];
        fleetSharkIDs.map(id => this.getGroupById(id)).forEach(g => fleetGroups.push(g!));

        if (this.zoomLevel == 4) {
            fleetGroups.forEach(g => g.removeClass(BasicViewHelper.INVISIBLE_CLASS));
            fleetCollectionGroups.filter(g => g.classes().filter(c => c == BasicViewHelper.INVISIBLE_CLASS).length == 0).forEach(g => g.addClass(BasicViewHelper.INVISIBLE_CLASS));
        } else {
            fleetGroups.filter(g => g.classes().filter(c => c == BasicViewHelper.INVISIBLE_CLASS).length == 0).forEach(g => g.addClass(BasicViewHelper.INVISIBLE_CLASS));
            fleetCollectionGroups.forEach(g => g.removeClass(BasicViewHelper.INVISIBLE_CLASS));
        }
    }

    private zoomResizableContents() {
        const elements = this.canvas?.children()
            .filter(c => c.classes().filter(c => c == BasicViewHelper.RESIZE_ON_ZOOM_MARKER).length != 0);
        elements!.forEach(c => {
            if ('radius' in c) {
                this.resizeCelestial(c);
            }
            if (c.classes().filter(c => c == BasicViewHelper.ROUND_CAP_MARKER).length != 0) {
                this.repositioningRoundCapMarker(c);
            }
        });
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
        const isStar = c.classes().filter(c => c == BasicViewHelper.STAR_MARKER).length != 0;
        if (isStar) {
            baseRadius = BasicViewHelper.STAR_RADIUS;
        }
        const isStarInSystem = c.classes().filter(c => c == BasicViewHelper.STAR_IN_SYSTEM_MARKER).length != 0;
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
        const orbit: Orbit = orbitDefinition.orbit;
        let orbitID = this.getOrbitID(orbit);
        let celestialBodyID = this.getCelestialBodyID(orbit);
        this.setOrbitById(orbitID, orbit);
        this.addCelestialArea(orbit, orbitID);

        const x = this.convertToStandardMetric(orbit.xCoordinate);
        const y = this.convertToStandardMetric(orbit.yCoordinate);
        if (orbitDefinition.isColonizable) {
            // to rotate around the center just flip the + and -
            this.createRoundCapMarkerNorth(x, y);
        }

        const circle = this.canvas!
            .circle()
            .x(x)
            .y(y)
            .id(celestialBodyID)
            .addClass(BasicViewHelper.RESIZE_ON_ZOOM_MARKER);

        if ('idPlanet' in orbitDefinition.celestial) {
            circle.addClass("planet");
            circle.radius(BasicViewHelper.PLANET_RADIUS);
        } else {
            circle.addClass(BasicViewHelper.STAR_MARKER);
            circle.radius(BasicViewHelper.STAR_RADIUS);
        }

        if (orbitDefinition.isColonizedByLoggedInUser) {
            circle.addClass(BasicViewHelper.IS_COLONIZED_BY_USER_COLOR_CSS_CLASS);
        } else if (orbitDefinition.isColonizedByOtherUser) {
            circle.addClass(BasicViewHelper.COLONIZED_BY_OTHERS_COLOR_CSS_CLASS);
        } else {
            circle.addClass(BasicViewHelper.NOT_COLONIZED_COLOR_CSS_CLASS);
        }
        this.setCelestialCircleById(celestialBodyID, circle);
        this.setCelestialObjectById(orbitID, orbitDefinition.celestial);
        this.setCelestialObjectById(celestialBodyID, orbitDefinition.celestial);

        let text: Text = new Text()
            .addClass(BasicViewHelper.TEXT_MARKER)
            .addClass(BasicViewHelper.ICON_ID_MARKER + celestialBodyID)
            .text(orbitDefinition.name)
            .x(circle.cx() + 10)
            .y(circle.cy() - 20);

        this.setTextOptions(text);

        if (!orbitDefinition.isColonizedByLoggedInUser && !orbitDefinition.isColonizedByOtherUser) {
            // add only texts which must be switched
            this.setTextById(orbitID, text);
        } else {
            // display constantly
            this.canvas!.add(text);
        }
        this.setCelestialOrbitById(celestialBodyID, orbit);
    }

    createRoundCapMarkerNorth(x: number, y: number, xShifter?: number, yShifter?: number) {
        let arr = this.createRoundCapMarkerNorthPoints(x, y, xShifter, yShifter);
        this.canvas!.path(arr)
            .fill(BasicViewHelper.NONE_FILL_COLOR)
            .addClass(BasicViewHelper.COLONIZABLE_SYSTEM_MARKER_CSS_CLASS)
            .addClass(BasicViewHelper.RESIZE_ON_ZOOM_MARKER)
            .addClass(BasicViewHelper.ROUND_CAP_MARKER)
            .addClass(this.getCenterMarker(x, y))
            .addClass("roundCap");
    }

    private getCenterMarker(x: number, y: number) {
        return BasicViewHelper.CENTER_COORDINATES_MARKER + x + BasicViewHelper.CENTER_COORDINATES_SEPARATOR + y;
    }

    private getCoordsFromCenterMarker(element: Element): ArrayXY | undefined {
        const markers = element.classes().filter(c => c.startsWith(BasicViewHelper.CENTER_COORDINATES_MARKER));
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
        const split = cssClass.replace(BasicViewHelper.CENTER_COORDINATES_MARKER, '').split(BasicViewHelper.CENTER_COORDINATES_SEPARATOR);
        if (!split) {
            return undefined;
        }
        const x = split[0];
        const y = split[1];
        return [Number.parseFloat(x), Number.parseFloat(y)];
    }

    private clickEventForCelestial = (event: PointerEvent) => {
        if (!this.starMapCommService.isStarSystemDisplayed() && !this.starMapCommService.isSelectedStarSystem() && !this.starMapCommService.isSelectedFleetMarker()) {
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
        let id = this.getIdFromEvent(event);
        const celestial = this.getCelestialObjectByID(id);
        if (!celestial) {
            console.log("No celestial found for '" + id + "'");
            return;
        }
        let elements = this.canvas!.children().filter(value => value.id() === this.getCyclingCircleId(id));
        if ('idStarSystem' in celestial) {
            this.handleClickedStarSystem(celestial, elements, x, y, id, event);
        } else if ('idPlanet' in celestial) {
            this.handleClickedPlanet(celestial, elements, x, y, id, event);
        }
    };

    private handleClickedStarSystem(celestial: Planet | StarSystem, elements: Element[], x: number, y: number, id: string, event: PointerEvent) {
        if (this.starMapCommService.isSelectedStarSystem(celestial.idStarSystem)) {
            if (elements.length > 0) {
                // remove selected system
                const cycleCircle = elements[0];
                this.canvas!.removeElement(cycleCircle);
                this.starMapCommService.removeSelectedStarSystem();
            }
            return;
        }
        if (this.starMapCommService.isSelectedStarSystem()) {
            return;
        }
        if (elements.length == 0) {
            // add selected system
            this.drawCyclingCircle(x, y, id);

            this.starMapCommService.setSelectedStarSystem(this.getStarSystemByEvent(event)!);
        }
    }

    private handleClickedPlanet(celestial: Planet, elements: Element[], x: number, y: number, id: string, event: PointerEvent) {
        if (this.starMapCommService.isSelectedPlanet(celestial.idPlanet)) {
            if (elements.length > 0) {
                // remove selected system
                elements.forEach(e => this.canvas!.removeElement(e));
                this.starMapCommService.removeSelectedPlanet();
            }
            return;
        }
        if (this.starMapCommService.isSelectedPlanet()) {
            return;
        }
        if (elements.length == 0) {
            // add selected system
            this.drawCyclingCircle(x, y, id);

            this.starMapCommService.setSelectedPlanet(this.getPlanetByEvent(event)!);
        }
    }

    private getCyclingCircleId(id: string) {
        return id + BasicViewHelper.CYCLING_CIRCLE_SUFFIX;
    }

    private clickEventForFleetGroup = (event: PointerEvent) => {
        this.handleClickFleet(event);
        this.handleClickedFleetCollection(event);
    };

    private handleClickedFleetCollection(event: PointerEvent) {
        let id = this.getIdFromEvent(event);
        let fleetCollection = this.getGroupById(id);
        if (!!fleetCollection) {
            const isInvisible = fleetCollection.classes().filter(css => css == BasicViewHelper.INVISIBLE_CLASS).length > 0;
            if (isInvisible) {
                return;
            }

            const fleetSharkIDs: string[] = [];
            const id = fleetCollection.id();
            let elements = this.canvas!.children().filter(value => value.id() === this.getCyclingCircleId(id));

            this.getFleetSharkIDsFromCollectionID(id).forEach(id => fleetSharkIDs.push(id));
            const fleetMarkers = fleetSharkIDs.map(fleetSharkId => this.getFleetByID(fleetSharkId));
            if (elements.length == 0) {
                const x = Number.parseFloat(fleetCollection.cx() + '');
                const y = Number.parseFloat(fleetCollection.cy() + '');
                this.drawCyclingCircle(x, y, id);
                fleetMarkers.filter(f => !!f).forEach(fleetMarker => this.starMapCommService.addFleetMarker(fleetMarker!));
            } else {
                this.canvas!.removeElement(elements[0]);
                fleetMarkers.filter(f => !!f).forEach(fleetMarker => this.starMapCommService.removeSelectedFleetMarker(fleetMarker!));
            }
        }
    }

    private handleClickFleet(event: PointerEvent) {
        let fleet = this.getFleetByEvent(event);
        const userID = this.tokenStorage.getUserID();
        if (!!fleet && fleet.owner.id === userID) {
            let id = this.getIdFromEvent(event);
            let fleetShark: Polygon | G | undefined = this.getFleetSharkByID(id);
            if (!fleetShark) {
                fleetShark = this.getGroupById(id);
            }
            if (!!fleetShark) {
                const isInvisible = fleetShark.classes().filter(css => css == BasicViewHelper.INVISIBLE_CLASS).length > 0;
                if (isInvisible) {
                    return;
                }
                let elements = this.canvas!.children().filter(value => value.id() === this.getCyclingCircleId(id));
                if (elements.length == 0) {
                    // add fleet marker to selection
                    let x = fleetShark.cx();
                    let y = fleetShark.cy();
                    this.drawCyclingCircle(x, y, id);
                    this.displayMovePath(fleet);
                    this.starMapCommService.addFleetMarker(fleet!);
                    return;
                }
                if (elements.length > 0) {
                    this.canvas!.removeElement(elements[0]);
                    const movePath = this.canvas!.children().filter(c => c.id() == id + BasicViewHelper.MOVE_SUFFIX)[0];
                    this.canvas!.removeElement(movePath);
                    this.starMapCommService.removeSelectedFleetMarker(fleet!);
                }
            }
        }
    }

    private drawCyclingCircle(x: number, y: number, id: string) {
        const radius = BasicViewHelper.CYCLING_CIRCLE_RADIUS / this.zoomLevel;
        const circle = new Circle().x(x).y(y)
            .radius(radius)
            .stroke(this.zoomStroke(BasicViewHelper.STROKE_CYCLING_CIRCLE))
            .addClass(BasicViewHelper.CYCLING_CIRCLE_MARKER)
            .addClass(BasicViewHelper.ICON_ID_MARKER + id)
            .id(this.getCyclingCircleId(id));
        // starts-with because its mainly about the groups which contains the elements
        const element = this.canvas!.children().filter(value => value.id().startsWith(id));
        if (element.length > 0) {
            element.forEach(elm => this.canvas!.removeElement(elm));
        }
        this.canvas!.add(circle);
        this.canvas!.add(element[0]);
    }

    private getStarSystemByEvent = (event: PointerEvent): StarSystem | undefined => {
        let orbitByID = this.getOrbitOfCelestialByEvent(event);
        if (!!orbitByID) {
            return this.getKnownStarSystemByOrbit(orbitByID);
        }
        return undefined;
    };

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
        const idMarker = text.classes().filter(css => css.startsWith(BasicViewHelper.ICON_ID_MARKER));
        if (idMarker.length > 0) {
            const id = idMarker[0].replace(BasicViewHelper.ICON_ID_MARKER, '');
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

    protected createPolarCoordinateSystem() {
        let {x, y} = this.getWidestExpanse();
        this.radiusOfCoordinateCross = BasicViewHelper.calculateDistance(x, y);
        this.radiusOfCoordinateCross *= 1.1;

        this.createLocalPolarCoordinateSystem(0, 0, this.radiusOfCoordinateCross, undefined);
    }

    protected createLocalPolarCoordinateSystem(xBase: number, yBase: number, radius: number, idPrefix?: string) {
        let steps = 6;
        const radiusSteps = radius / steps;
        for (let i = 0; i < steps; i++) {
            this.canvas!
                .circle()
                .x(xBase)
                .y(yBase)
                .fill(BasicViewHelper.NONE_FILL_COLOR)
                .id(idPrefix + "-coordCross" + i)
                .addClass("coordCross")
                .radius(radiusSteps * i);
        }
        const degree = 12;
        for (let j = 1; j <= 30; j++) {
            const angle = j * degree;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const points: ArrayXY[] = [[xBase, yBase], [xBase + x, yBase + y]];
            this.canvas!
                .line(points)
                .id(idPrefix + "-coordCross-line" + j)
                .addClass("coordCross")
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

    /**
     * calculates the distance between two points
     *
     * @param firstCoordinate the first coordinate
     * @param secondCoordinate the second coordinate
     * @private
     */
    public static calculateDistanceOfPoints(firstCoordinate: ArrayXY, secondCoordinate: ArrayXY): number {
        return Math.sqrt(Math.pow(firstCoordinate[0] - secondCoordinate[0], 2) + Math.pow(firstCoordinate[1] - secondCoordinate[1], 2));
    }

    /**
     * calculates the distance between two points
     *
     * @param firstOrbit the first coordinate
     * @param secondOrbit the second coordinate
     * @private
     */
    public calculateDistanceOfOrbits(firstOrbit: Orbit, secondOrbit: Orbit): number {
        const originX = NavigationCalculator.convertDistanceToMetric(firstOrbit.xCoordinate, this.standardDistanceMetric);
        const originY = NavigationCalculator.convertDistanceToMetric(firstOrbit.yCoordinate, this.standardDistanceMetric);
        const destinationX = NavigationCalculator.convertDistanceToMetric(secondOrbit.xCoordinate, this.standardDistanceMetric);
        const destinationY = NavigationCalculator.convertDistanceToMetric(secondOrbit.yCoordinate, this.standardDistanceMetric);

        return BasicViewHelper.calculateDistanceOfPoints([originX, originY], [destinationX, destinationY]);
    }

    protected defineFleetSharkPoints(x: number, y: number, zoomFactor?: number) {
        if (!zoomFactor) {
            zoomFactor = 1;
        }
        let points: ArrayXY[] = [];
        points.push([x, y]);
        points.push([x + (20 / zoomFactor), y - (7.5 / zoomFactor)]);
        points.push([x + (15 / zoomFactor), y]);
        points.push([x + (20 / zoomFactor), y + (5 / zoomFactor)]);
        points.push([x, y]);
        return points;
    }

    protected createFleetSharkPoints(x: number, y: number, orbit: Orbit, zoomFactor?: number): ArrayXY[] {
        if (!zoomFactor) {
            zoomFactor = 1;
        }
        let points = this.defineFleetSharkPoints(x, y, zoomFactor);

        let restrictedFleetArea = new RestrictedFleetArea(points);

        let orbitID = this.getOrbitID(orbit);
        if (!this.isOrbitIdInRestrictedAreas(orbitID)) {
            let areas = [];
            areas.push(restrictedFleetArea);
            this.setRestrictedArea(orbitID, areas);
        } else {
            let areas = this.getRestrictedArea(orbitID);
            let restrictedFleetAreas: RestrictedFleetArea[] = areas!.filter(area => area.collides(points));
            if (restrictedFleetAreas.length != 0) {
                const modifier = 35 / zoomFactor;
                points = this.createFleetSharkPoints(x, y + (modifier * restrictedFleetAreas.length), orbit, zoomFactor);
            }
            areas!.push(restrictedFleetArea);
        }
        return points;
    }

    protected createFleetCollectionIcon(x: number, y: number, fleetCollectionID: string, amountOwnFleets: number, amountOtherFleets: number, colorForOutline: string): G {

        let group = this.canvas!.group().id(fleetCollectionID + "-" + BasicViewHelper.GROUP_SELECTOR_SUFFIX);
        this.setGroupById(fleetCollectionID + "-" + BasicViewHelper.GROUP_SELECTOR_SUFFIX, group!);

        x += 10;
        y -= 5;
        group.rect()
            .x(x).y(y)
            .addClass("fleet-collection-rect")
            .stroke({color: colorForOutline});

        group.rect()
            .x(x).y(y)
            .addClass("fleet-collection-rect-textbox")
            .stroke({color: colorForOutline});

        const amountOfFleets = amountOwnFleets + amountOtherFleets;
        const amountInRoman = this.romanPipe.transform(amountOfFleets);
        let text: Text = new Text()
            .text(amountInRoman)
            .x(x + 2)
            .y(y - 6)
            .addClass("fleet-collection-text")
            .id(fleetCollectionID + "-txt");

        group.add(text);
        // fixme add 'fleet dots' to display the friend-foe distribution
        return group;
    }

    protected createFleetGroup(fleetMarker: FleetMarker, x: number, y: number, orbit?: Orbit): G {
        let fleetSharkPoints: ArrayXY[];
        if (!orbit) {
            fleetSharkPoints = this.defineFleetSharkPoints(x, y);
        } else {
            fleetSharkPoints = this.createFleetSharkPoints(x, y, orbit);
        }
        const userIsOwner = fleetMarker.owner.id == this.tokenStorage.getUserID();
        let fleetSharkID = this.getFleetSharkID(fleetMarker);
        this.setFleetById(fleetSharkID, fleetMarker);

        let group = this.canvas!.group().id(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX);
        this.setGroupById(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX, group);

        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (userIsOwner) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }

        const fleetShark = group
            .polygon(fleetSharkPoints)
            .fill(fleetSharkColor)
            .stroke(BasicViewHelper.STROKE_BLACK)
            .addClass(BasicViewHelper.FLEET_SHARK_POLYGON_MARKER)
            .id(fleetSharkID);

        if (!!orbit) {
            const orbitID = this.getOrbitID(orbit);
            fleetShark.addClass(BasicViewHelper.ORBIT_ID_MARKER + orbitID);
        }
        fleetShark.addClass(this.getCenterMarker(x, y));

        this.setFleetPolygonById(fleetSharkID, fleetShark);

        let {sortedPointsX, sortedPointsY} = this.sortPoints(fleetSharkPoints);

        this.displayFleetStates(fleetMarker, sortedPointsX, sortedPointsY, group, fleetSharkID);

        let {xText, yText} = this.getUpperRightCornerPosition(sortedPointsX, sortedPointsY);

        let fleetSharkText: string = fleetMarker.name
        if (fleetMarker.owner.id != this.tokenStorage.getUserID()) {
            fleetSharkText += " of " + fleetMarker.owner.name;
        }

        let text: Text = new Text()
            .addClass(BasicViewHelper.TEXT_MARKER)
            .addClass(BasicViewHelper.ICON_ID_MARKER + fleetSharkID)
            .text(fleetSharkText)
            .x(xText[0])
            .y(yText[1]);

        this.setTextOptions(text);

        this.canvas?.add(group);
        this.setTextById(fleetSharkID, text);
        this.setFleetTextByMarker(text, fleetMarker);
        return group;
    }

    protected sortPoints(fleetSharkPoints: ArrayXY[]) {
        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);
        return {sortedPointsX, sortedPointsY};
    }

    protected getUpperRightCornerPosition(sortedPointsX: ArrayXY[], sortedPointsY: ArrayXY[]) {
        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];
        return {xText, yText};
    }

    protected createFleetCollection(fleetMarkers: FleetMarker[]) {

        const ownFleets = fleetMarkers.filter(f => f.owner.id == this.tokenStorage.getUserID());
        const otherFleets = fleetMarkers.filter(f => f.owner.id != this.tokenStorage.getUserID());

        let fleetSharkColor = this.FLEET_COLLECTION_COLOR_MIXED;
        if (otherFleets.length == 0 && ownFleets.length > 0) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        if (otherFleets.length > 0 && ownFleets.length == 0) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        }

        const system = fleetMarkers[0].orbit!.system!;

        const orbit = system!.orbit;
        let fleetCollectionID = this.getFleetCollectionID(fleetMarkers);
        this.createFleetCollectionIcon(orbit.xCoordinate.coordinate, orbit.yCoordinate.coordinate, fleetCollectionID, ownFleets.length, otherFleets.length, fleetSharkColor);

        fleetMarkers.forEach(fleetMarker => {
            const fleetGroup = this.createFleetGroup(fleetMarker, orbit.xCoordinate.coordinate, orbit.yCoordinate.coordinate, orbit);
            fleetGroup.addClass(BasicViewHelper.INVISIBLE_CLASS);
        })

    }

    protected getOrbitID(orbit: Orbit): string {
        return BasicViewHelper.ORBIT_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
    }

    protected createStellarCoursePlot(move: Move) {
        if (!move.startOrbit.orbit || !move.targetOrbit.orbit) {
            throw new Error("The move should have a origin and a destination.");
        }
        const xOrigin = move.startOrbit.orbit.xCoordinate;
        const yOrigin = move.startOrbit.orbit.yCoordinate;
        const xDestination = move.targetOrbit.orbit.xCoordinate;
        const yDestination = move.targetOrbit.orbit.yCoordinate;

        return this.createCoursePlot(xOrigin, yOrigin, xDestination, yDestination);
    }

    protected createCoursePlot(xOrigin: Distance, yOrigin: Distance, xDestination: Distance, yDestination: Distance) {
        let startX: number = this.convertToStandardMetric(xOrigin);
        let startY: number = this.convertToStandardMetric(yOrigin);

        let endX: number = this.convertToStandardMetric(xDestination);
        let endY: number = this.convertToStandardMetric(yDestination);

        let color: string;
        if (BasicViewHelper.calculateDistance(startX, startY) <= BasicViewHelper.calculateDistance(endX, endY)) {
            color = this.COURSE_PLOT_COLOR_OUTBOUND;
        } else {
            color = this.COURSE_PLOT_COLOR_INBOUND;
        }

        let p1: LineCommand = ["M", startX, startY];
        let p2: LineCommand = ["L", endX, endY];

        let arr: LineCommand[] = [p1, p2];
        return {color, arr};
    }

    protected displayMovePath(fleetMarker: FleetMarker) {
        if (!fleetMarker.move) {
            return;
        }

        let startOrbit = fleetMarker.move!.startOrbit.system!.orbit;
        let targetOrbit = fleetMarker.move!.targetOrbit.system!.orbit;
        const xStart = startOrbit.xCoordinate.coordinate;
        const yStart = startOrbit.yCoordinate.coordinate;
        const xEnd = targetOrbit.xCoordinate.coordinate;
        const yEnd = targetOrbit.yCoordinate.coordinate;

        let angle = NavigationCalculator.angle(xStart, yStart, xEnd, yEnd);
        let p1: ArrayXY = [xStart, yStart + 10];
        let p2: ArrayXY = [xStart + 20, yStart + 10];
        let p3: ArrayXY = [xStart + 10, yStart];

        p2 = NavigationCalculator.rotatePoint(p1, angle + 90, p2);
        p3 = NavigationCalculator.rotatePoint(p1, angle + 90, p3);

        let fleetSharkId = this.getFleetSharkID(fleetMarker);

        this.canvas!
            .polygon([p1, p2, p3])
            .addClass('coursePlot')
            .id(fleetSharkId + BasicViewHelper.MOVE_SUFFIX)
            .animate({
                duration: 2000,
                delay: 1000,
                when: 'now',
                swing: false,
                times: 50000,
                wait: 200
            })
            .transform({
                positionX: xEnd,
                positionY: yEnd
            });
    }

    public static isSameOrbit(first: Orbit, second: Orbit): boolean {
        let isEqual = true;
        if (first.xCoordinate.coordinate != second.xCoordinate.coordinate) {
            isEqual = false;
        }
        if (first.yCoordinate.coordinate != second.yCoordinate.coordinate) {
            isEqual = false;
        }
        return isEqual;
    }

    protected calculateHyperLimit(system: StarSystem) {
        const lightMinutesToHyperLimit = system.starClassType.lightMinutesToHyperLimit;
        const hyperRadius: Distance = {
            coordinate: lightMinutesToHyperLimit,
            distanceMetric: DistanceMetricEnum.LM
        }
        return this.convertToStandardMetric(hyperRadius);
    }

    protected displayFleetStates(fleetMarker: FleetMarker, sortedPointsX: ArrayXY[], sortedPointsY: ArrayXY[], group: G | undefined, fleetSharkID: string) {

        let txt;
        const cssClasses: string[] = [];
        const move = fleetMarker.move;
        if (!!move) {
            cssClasses.push('on-movement')
            txt = 'Fleet in at move';
        }
        const state = fleetMarker.state;
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
            let xMarker = sortedPointsX[0];
            let yMarker = sortedPointsY[sortedPointsY.length - 1];

            group!
                .circle(BasicViewHelper.STATE_DOT_RADIUS)
                .stroke(BasicViewHelper.STROKE_BLACK)
                .addClass(BasicViewHelper.MOVABLE_STATE_DOT_MARKER)
                .addClass(BasicViewHelper.ICON_ID_MARKER + fleetSharkID)
                .x(xMarker[0] - 2.5)
                .y(yMarker[1] - 2.5)
                .id(fleetSharkID + BasicViewHelper.MOVABLE_STATE_DOT_MARKER);

            cssClasses.forEach(c => group!.addClass(c));

            let text: Text = new Text()
                .addClass(BasicViewHelper.TEXT_MARKER)
                .addClass(BasicViewHelper.MOVABLE_STATE_DOT_MARKER)
                .addClass(BasicViewHelper.ICON_ID_MARKER + fleetSharkID)
                .text(txt)
                .x(xMarker[0] - 2.5)
                .y(yMarker[1] - 2.5)
                .id(fleetSharkID + BasicViewHelper.MOVABLE_STATE_DOT_MARKER + BasicViewHelper.TEXT_MARKER);

            this.setTextOptions(text);

            this.setTextById(fleetSharkID + BasicViewHelper.MOVABLE_STATE_DOT_MARKER, text);
        }
    }
}
