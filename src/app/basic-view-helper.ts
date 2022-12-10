import {SubscriptionManager} from "./SubscriptionManager";
import {AbstractId, CounterMissileHit, Distance, Fleet, FleetMarker, FleetOrbit, MissileMovement, Move, Orbit, Planet, StarSystem, WarShip} from "./services/swagger";
import {ArrayXY, Circle, CurveCommand, Element, G, LineCommand, Path, PathArrayAlias, Polygon, Shape, SVG, Svg, Text} from "@svgdotjs/svg.js";
import {RestrictedFleetArea} from "./modules/star-map/payload/restricted-fleet-area";
import {CelestialAreaDefinition} from "./modules/star-map/payload/celestial-area-definition";
import {AreaDefinition} from "./modules/star-map/area-definition";
import {OrbitDefinition} from "./modules/star-map/payload/orbit-definition";
import {NavigationCalculator} from "./NavigationCalculator";
import {Component, HostListener} from "@angular/core";
import {StarMapCommunicationService} from "./star-map-communication.service";
import {AppInjector} from "./app.module";
import {TokenStorage} from "./services/authentication/token-storage.service";
import DistanceMetricEnum = Distance.DistanceMetricEnum;


@Component({
    template: ''
})
export class BasicViewHelper extends SubscriptionManager {

    starMapCommService = AppInjector.get(StarMapCommunicationService);

    public static readonly PAN_ZOOM_OPTIONS = {
        // https://github.com/svgdotjs/svg.panzoom.js/blob/master/readme.md
        zoomFactor: 0.3, // zooming per wheel tick
        zoomMin: 0.1, // zoom max out to display the full svg payload as 20% of the screen
        zoomMax: 4 // zoom max 4 times in
    };
    public readonly STANDARD_METRIC;

    protected tokenStorage: TokenStorage;

    constructor(tokenStorage: TokenStorage,
                private standardDistanceMetric: DistanceMetricEnum) {
        super();

        this.tokenStorage = tokenStorage;
        this.STANDARD_METRIC = standardDistanceMetric;
        const sub = this.starMapCommService.getDeselectEverythingEmitter().subscribe(resp => {
            const elements = this.canvas?.children().filter(elem => elem.id().endsWith(BasicViewHelper.CYCLING_CIRCLE_SUFFIX) || elem.id().endsWith(BasicViewHelper.MOVE_SUFFIX));
            if (!!elements && elements.length > 0) {
                elements.forEach(elem => this.canvas?.removeElement(elem));
            }
        });
        this.subscriptions.push(sub);
    }

    protected static readonly ROUND_CAP_MARKER_X_PIXEL_SHIFT: number = 9;
    protected static readonly ROUND_CAP_MARKER_Y_PIXEL_SHIFT: number = 8;

    protected readonly FLEET_SHARK_COLOR_HOSTILE = "red";
    protected readonly FLEET_SHARK_COLOR_OWN = "green";

    protected readonly COURSE_PLOT_COLOR_OUTBOUND: string = "green";
    protected readonly COURSE_PLOT_COLOR_INBOUND: string = "red";

    protected static readonly ROUND_CAP_MARKER = "colonizableMarker";
    protected static readonly NO_RESIZE_MARKER = "no-resize";
    protected static readonly STAR_MARKER = "star";
    protected static readonly STAR_IN_SYSTEM_MARKER = "star-in-system";
    protected static readonly HYPER_LIMIT_MARKER = "hyper-limit";
    public static readonly NONE_FILL_COLOR = "none";
    protected static readonly ORBIT_MARKER = "orbit";
    protected static readonly CENTER_COORDINATES_MARKER = "center-";
    protected static readonly CENTER_COORDINATES_SEPARATOR = "|";

    protected static readonly NOT_COLONIZED_COLOR_CSS_CLASS = "not-colonized";
    protected static readonly IS_COLONIZED_BY_USER_COLOR_CSS_CLASS = "colonized-by-user";
    protected static readonly COLONIZED_BY_OTHERS_COLOR_CSS_CLASS = "colonized-by-others";
    protected static readonly COLONIZABLE_SYSTEM_MARKER_CSS_CLASS = "colonizable";

    protected static readonly PLANET_RADIUS = 5;
    protected static readonly STAR_RADIUS = 5;
    protected static readonly STAR_RADIUS_IN_SYSTEM = 15;

    knownStarSystemsByOrbit: Map<Orbit, StarSystem> = new Map<Orbit, StarSystem>();
    planetsByOrbit: Map<Orbit, Planet> = new Map<Orbit, Planet>();

    protected orbits?: Orbit[];

    protected smallestXOrbit?: Orbit;
    protected biggestXOrbit?: Orbit;
    protected smallestYOrbit?: Orbit;
    protected biggestYOrbit?: Orbit;

    protected radiusOfCoordinateCross?: number;

    protected canvas?: Svg;

    protected static readonly GROUP_SELECTOR_SUFFIX: string = Math.random() + "-group";
    protected static readonly CYCLING_CIRCLE_SUFFIX = "-circle-cycle";
    protected static readonly MOVE_SUFFIX = "-move";

    protected CELESTIAL_BODY_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    protected ORBIT_SELECTOR_ID_PREFIX: string = Math.random() + "-orbit";
    protected FLEET_SHARK_SELECTOR_ID_PREFIX: string = Math.random() + "-fleet-shark";
    protected WARSHIP_SELECTOR_ID_PREFIX: string = Math.random() + "-warship";
    protected MISSILE_SALVO_SELECTOR_ID_PREFIX: string = Math.random() + "-missile-salvo";

    protected hyperLimitRadius?: number;

    protected cycleCircleById: Map<String, Circle> = new Map<String, Circle>();

    protected celestialObjectById: Map<String, Planet | StarSystem> = new Map<String, Planet | StarSystem>();
    protected celestialBodyById: Map<String, Circle> = new Map<String, Circle>();
    protected celestialOrbitById: Map<String, Orbit> = new Map<String, Orbit>();
    protected orbitsById: Map<String, Orbit> = new Map<String, Orbit>();
    protected orbitTextsById: Map<String, Text> = new Map<String, Text>();

    protected fleetsById: Map<String, FleetMarker> = new Map<String, FleetMarker>();
    protected fleetsByText: Map<Text, FleetMarker> = new Map<Text, FleetMarker>();
    protected fleetTextsById: Map<String, Text> = new Map<String, Text>();
    protected fleetOwnersById: Map<String, AbstractId> = new Map<String, AbstractId>();
    protected fleetOwnerByText: Map<Text, AbstractId> = new Map<Text, AbstractId>();
    protected markerTextsById: Map<String, Text> = new Map<String, Text>();
    protected fleetPolygonsById: Map<String, Polygon> = new Map<String, Polygon>();

    protected warshipsById: Map<String, AbstractId> = new Map<String, AbstractId>();
    protected warshipPolygonsById: Map<String, Polygon> = new Map<String, Polygon>();
    protected warshipsByText: Map<Text, AbstractId> = new Map<Text, AbstractId>();
    protected warshipTextsById: Map<String, Text> = new Map<String, Text>();

    protected missileSalvoPolygonsById: Map<String, Polygon[]> = new Map<String, Polygon[]>();
    protected restrictedAreasByOrbitId: Map<String, RestrictedFleetArea[]> = new Map<String, RestrictedFleetArea[]>();
    protected groupsByID: Map<String, G> = new Map<String, G>();

    protected areaDefinitions: AreaDefinition[] = [];
    protected celestialAreas: CelestialAreaDefinition[] = [];

    protected aspectRatio: number = 1;

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

    clearCanvas() {
        if (!!this.canvas) {
            // remove all elements from canvas a little bit more performant
            this.canvas.node.innerHTML = '';
            this.celestialBodyById.clear();
            this.celestialOrbitById.clear();
            this.orbitsById.clear();
            this.fleetsById.clear();
            this.fleetTextsById.clear();
            this.fleetOwnerByText.clear();
            this.restrictedAreasByOrbitId.clear();
            this.groupsByID.clear();
            this.warshipPolygonsById.clear();
            this.orbitTextsById.clear();
            this.fleetsByText.clear();
            this.fleetOwnersById.clear();
            this.warshipsById.clear();
            this.warshipsByText.clear();
            this.warshipTextsById.clear();
            this.missileSalvoPolygonsById.clear();
            this.areaDefinitions = [];
            this.celestialAreas = [];
        }
    }

    protected setCanvas(canvas: Svg) {
        if (!canvas) {
            throw new Error("The canvas isn't initialized.");
        } else {
            this.canvas = canvas;
        }
    }

    zoomLevel: number = 1;

    createCanvas(id: string, parentCssId: string): void {
        if (!this.canvas) {
            this.canvas = SVG().id(id).addTo(parentCssId).panZoom(BasicViewHelper.PAN_ZOOM_OPTIONS);
            this.canvas.on('zoom', this.zoomModification)
        }
    }

    private zoomModification = (ev: any) => {
        this.zoomLevel = ev.detail.level;
        this.zoomCircles();
    }

    private zoomCircles() {
        const elements = this.canvas?.children()
            .filter(c => c.classes().filter(c => c == BasicViewHelper.NO_RESIZE_MARKER).length != 0);
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
        const markers = path.classes().filter(c => c.startsWith(BasicViewHelper.CENTER_COORDINATES_MARKER));
        if (!!markers && markers.length == 1) {
            const center = this.getCenterCoordinatesFromMarker(markers[0]);
            if (!!center) {
                let xShifter = undefined;
                let yShifter = undefined;
                if (this.zoomLevel > 1) {
                    xShifter = BasicViewHelper.ROUND_CAP_MARKER_X_PIXEL_SHIFT / this.zoomLevel;
                    yShifter = BasicViewHelper.ROUND_CAP_MARKER_Y_PIXEL_SHIFT / this.zoomLevel;
                }
                let arr = this.createRoundCapMarkerNorthPoints(center[0], center[1], xShifter, yShifter);
                path.plot(arr)
            }
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

    protected convertToStandardMetric(distance: Distance): number {
        return NavigationCalculator.convertDistanceToMetric(distance, this.standardDistanceMetric);
    }

    protected drawCelestial(orbitDefinition: OrbitDefinition) {
        const orbit: Orbit = orbitDefinition.orbit;
        let orbitID = this.getOrbitID(orbit);
        let celestialBodyID = this.getCelestialBodyID(orbit);

        this.orbitsById.set(orbitID, orbit);
        this.celestialAreas.push(new CelestialAreaDefinition(orbit, orbitID, 50));

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
            .addClass(BasicViewHelper.NO_RESIZE_MARKER)
            .click(this.clickEventForCelestial)
            .mouseover(this.mouseoverForCelestial)
            .mouseleave(this.mouseleaveForCelestial);

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

        this.celestialBodyById.set(celestialBodyID, circle);
        this.celestialObjectById.set(orbitID, orbitDefinition.celestial);
        this.celestialObjectById.set(celestialBodyID, orbitDefinition.celestial);

        let text: Text = new Text()
            .text(orbitDefinition.name)
            .x(circle.cx() + 10)
            .y(circle.cy() - 20)
            .addClass("celestial-text");

        if (!orbitDefinition.isColonizedByLoggedInUser && !orbitDefinition.isColonizedByOtherUser) {
            // add only texts which must be switched
            this.orbitTextsById.set(orbitID, text);
        } else {
            // display constantly
            this.canvas!.add(text);
        }
        this.celestialOrbitById.set(celestialBodyID, orbit);
    }

    createRoundCapMarkerNorth(x: number, y: number, xShifter?: number, yShifter?: number) {
        let arr = this.createRoundCapMarkerNorthPoints(x, y, xShifter, yShifter);
        this.canvas!.path(arr)
            .fill(BasicViewHelper.NONE_FILL_COLOR)
            .addClass(BasicViewHelper.COLONIZABLE_SYSTEM_MARKER_CSS_CLASS)
            .addClass(BasicViewHelper.NO_RESIZE_MARKER)
            .addClass(BasicViewHelper.ROUND_CAP_MARKER)
            .addClass(BasicViewHelper.CENTER_COORDINATES_MARKER + x + BasicViewHelper.CENTER_COORDINATES_SEPARATOR + y)
            .addClass("roundCap");
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

    private mouseoverForCelestial = (event: PointerEvent) => {
        const orbitText = this.getOrbitTextByEvent(event);
        if (!!orbitText) {
            this.canvas?.add(orbitText)
        }
    }

    private mouseleaveForCelestial = (event: PointerEvent) => {
        const orbitText = this.getOrbitTextByEvent(event);
        if (!!orbitText) {
            this.canvas?.removeElement(orbitText)
        }
    }

    private clickEventForCelestial = (event: PointerEvent) => {
        // fixme set up two use cases universe and system
        if (!this.starMapCommService.isStarSystemDisplayed() && !this.starMapCommService.isSelectedStarSystem() && !this.starMapCommService.isSelectedFleetMarker()) {
            let orbitByID = this.getOrbitOfCelestialByEvent(event);
            if (!!orbitByID) {
                let system = this.knownStarSystemsByOrbit.get(orbitByID);
                if (!!system) {
                    this.starMapCommService.displaySystem(system);
                }
                return;
            }
        }

        const celestialCircle = this.getCelestialByEvent(event);
        if (!celestialCircle) {
            return;
        }
        let id = this.getIdFromEvent(event);
        const celestial = this.getCelestialObjectByID(id);
        if (!celestial) {
            console.log("No celestial found for '" + id + "'");
            return;
        }
        let elements = this.canvas!.children().filter(value => value.id() === this.getCyclingCircleId(id));
        if ('idStarSystem' in celestial) {
            if (this.starMapCommService.isSelectedStarSystem(celestial.idStarSystem)) {
                if (elements.length > 0) {
                    // remove selected system
                    const cycleCircle = elements[0];
                    this.canvas!.removeElement(cycleCircle);
                    this.cycleCircleById.delete(cycleCircle.id());
                    this.starMapCommService.removeSelectedStarSystem();
                }
                return;
            }
            if (this.starMapCommService.isSelectedStarSystem()) {
                return;
            }
            if (elements.length == 0) {
                // add selected system
                this.drawCyclingCircle(celestialCircle);

                this.starMapCommService.setSelectedStarSystem(this.getStarSystemByEvent(event)!);
            }
        }
        if ('idPlanet' in celestial) {
            if (this.starMapCommService.isSelectedPlanet(celestial.idPlanet)) {
                if (elements.length > 0) {
                    // remove selected system
                    elements.forEach(e => this.canvas!.removeElement(e));
                    this.cycleCircleById.delete(elements[0].id());
                    this.starMapCommService.removeSelectedPlanet();
                }
                return;
            }
            if (this.starMapCommService.isSelectedPlanet()) {
                return;
            }
            if (elements.length == 0) {
                // add selected system
                this.drawCyclingCircle(celestialCircle);

                this.starMapCommService.setSelectedPlanet(this.getPlanetByEvent(event)!);
            }
        }
    };


    private drawCyclingCircle(celestialCircle: Circle) {
        let x = celestialCircle.cx();
        let y = celestialCircle.cy();
        let cycleCircle = new Circle().x(x).y(y).radius(BasicViewHelper.PLANET_RADIUS * 3).addClass("circle-cycle").id(celestialCircle.id() + BasicViewHelper.CYCLING_CIRCLE_SUFFIX);

        this.canvas!.removeElement(celestialCircle);
        this.canvas!.add(cycleCircle);
        this.cycleCircleById.set(celestialCircle.id(), cycleCircle);
        this.canvas!.add(celestialCircle);
    }

    private getCyclingCircleId(id: string) {
        return id + BasicViewHelper.CYCLING_CIRCLE_SUFFIX;
    }

    private clickEventForFleetGroup = (event: PointerEvent) => {
        let fleet = this.getFleetByEvent(event);
        if (!fleet) {
            const text = this.getFleetTextByEvent(event);
            if (!!text) {
                fleet = this.getFleetByText(text);
            }
        }

        const userID = this.tokenStorage.getUserID();
        if (!!fleet && fleet.owner.id === userID) {
            let id = this.getIdFromEvent(event);
            let fleetShark: Polygon | G | undefined = this.getFleetSharkByID(id);
            if (!fleetShark) {
                fleetShark = this.groupsByID.get(id);
            }
            let elements = this.canvas!.children().filter(value => value.id() === id + BasicViewHelper.CYCLING_CIRCLE_SUFFIX);
            if (!!fleetShark && elements.length == 0) {
                // add fleet marker to selection
                let x = fleetShark.cx();
                let y = fleetShark.cy();
                const circle = new Circle().x(x).y(y).radius(BasicViewHelper.PLANET_RADIUS * 3).addClass("circle-cycle").id(fleetShark.id() + BasicViewHelper.CYCLING_CIRCLE_SUFFIX);

                const element = this.canvas!.children().filter(value => value.id().startsWith(id));
                this.canvas!.removeElement(element[0]);

                this.displayMovePath(fleet);

                this.canvas!.add(circle);
                this.canvas!.add(element[0]);

                this.starMapCommService.addFleetMarker(fleet!);
                return;
            }
            if (!!fleetShark && elements.length > 0) {
                // remove fleet marker from selection
                // fixme this.canvas!.children().filter(value => value.id().startsWith(this.getFleetSharkID(fleet!) + BasicViewHelper.MOVE_SUFFIX));
                this.canvas!.removeElement(elements[0]);
                this.starMapCommService.removeSelectedFleetMarker(fleet!);
            }
        }
    };

    private getStarSystemByEvent = (event: PointerEvent): StarSystem | undefined => {
        let orbitByID = this.getOrbitOfCelestialByEvent(event);
        if (!!orbitByID) {
            return this.knownStarSystemsByOrbit.get(orbitByID);
        }
        return undefined;
    };

    private getPlanetByEvent = (event: PointerEvent): Planet | undefined => {
        let orbitByID = this.getOrbitOfCelestialByEvent(event);
        if (!!orbitByID) {
            return this.planetsByOrbit.get(orbitByID);
        }
        return undefined;
    };

    mouseoverForMarker = (event: PointerEvent) => {
        const orbitText = this.getMarkerTextByEvent(event);
        if (!!orbitText) {
            this.canvas?.add(orbitText)
        }
    }

    mouseleaveForMarker = (event: PointerEvent) => {
        const orbitText = this.getMarkerTextByEvent(event);
        if (!!orbitText) {
            this.canvas?.removeElement(orbitText)
        }
    }

    public static calculateDistance(firstCoordinate: number, secondCoordinate: number): number {
        return Math.sqrt(Math.pow(firstCoordinate, 2) + Math.pow(secondCoordinate, 2));
    }

    protected createPolarCoordinateSystem() {
        let x = 100;
        let y = 100;
        if (!!this.smallestXOrbit && !!this.smallestYOrbit && !!this.biggestXOrbit && !!this.biggestYOrbit) {
            // getting biggest, absolute coord because
            let minXCoord = Math.abs(this.convertToStandardMetric(this.smallestXOrbit.xCoordinate));
            let maxXCoord = Math.abs(this.convertToStandardMetric(this.biggestXOrbit.xCoordinate));
            x = Math.max(minXCoord, maxXCoord);
            let minYCoord = Math.abs(this.convertToStandardMetric(this.smallestYOrbit.yCoordinate));
            let maxYCoord = Math.abs(this.convertToStandardMetric(this.biggestYOrbit.yCoordinate));
            y = Math.max(minYCoord, maxYCoord);
        }
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
     * sorts the systems by their orbit's radius
     * @private
     */
    protected sortByOrbit() {
        if (!this.orbits) {
            throw new Error("The orbits must be present to calculate the map view.");
        }
        let sortedByX: Orbit[] = this.orbits.sort((a, b) => {
            return a.xCoordinate.coordinate < b.xCoordinate.coordinate ? -1 : 1;
        });
        this.smallestXOrbit = sortedByX[0];
        this.biggestXOrbit = sortedByX[sortedByX.length - 1];
        let sortedByY: Orbit[] = this.orbits.sort((a, b) => {
            return a.yCoordinate.coordinate < b.yCoordinate.coordinate ? -1 : 1;
        });
        this.smallestYOrbit = sortedByY[0];
        this.biggestYOrbit = sortedByY[sortedByY.length - 1];
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

    /**
     * set points for fleet shark
     *
     * @param x the base x coord
     * @param y the base y coord
     * @private
     */
    protected defineFleetSharkPoints(x: number, y: number) {
        let points: ArrayXY[] = [];
        let item: ArrayXY = [x, y];
        points.push(item);
        item = [x + 20, y - 7.5];
        points.push(item);

        item = [x + 15, y];
        points.push(item);

        item = [x + 20, y + 5];
        points.push(item);

        item = [x, y];
        points.push(item);
        return points;
    }

    /**
     * creates the points setup for the fleet sharks
     *
     * @param x the base x coord
     * @param y the base y coord
     * @param orbit the orbit where the fleet is located
     * @private
     */
    protected createFleetSharkPoints(x: number, y: number, orbit: Orbit): ArrayXY[] {
        let points = this.defineFleetSharkPoints(x, y);

        let restrictedFleetArea = new RestrictedFleetArea(points);

        let orbitID = this.getOrbitID(orbit);
        if (!this.restrictedAreasByOrbitId.has(orbitID)) {
            let areas = [];
            areas.push(restrictedFleetArea);
            this.restrictedAreasByOrbitId.set(orbitID, areas);
        } else {
            let areas = this.restrictedAreasByOrbitId.get(orbitID);
            let restrictedFleetAreas: RestrictedFleetArea[] = areas!.filter(area => area.collides(points));
            if (restrictedFleetAreas.length != 0) {
                points = this.createFleetSharkPoints(x, y + (35 * restrictedFleetAreas.length), orbit);
            }
            areas!.push(restrictedFleetArea);
        }
        return points;
    }

    protected createFleetGroup(fleetMarker: FleetMarker,
                               fleetSharkPoints: ArrayXY[],
                               dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void,
                               fleetOrbit: FleetOrbit | undefined) {

        const fleetSharkText: string = fleetMarker.name + " of " + fleetMarker.owner.name;
        const userIsOwner = fleetMarker.owner.id == this.tokenStorage.getUserID();
        let fleetSharkID = this.getFleetSharkID(fleetMarker);
        this.fleetsById.set(fleetSharkID, fleetMarker);
        this.fleetOwnersById.set(fleetSharkID, fleetMarker.owner);

        let group = this.canvas?.group().id(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX);
        this.groupsByID.set(fleetSharkID + BasicViewHelper.GROUP_SELECTOR_SUFFIX, group!);

        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (userIsOwner) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }

        const fleetShark = group!
            .polygon(fleetSharkPoints)
            .fill(fleetSharkColor)
            .addClass("stroke-outline")
            .id(fleetSharkID)
            .click(this.clickEventForFleetGroup)
            .dblclick((event: PointerEvent) => {
                dblClickForFleet(event, fleetOrbit);
            });
        this.fleetPolygonsById.set(fleetSharkID, fleetShark);

        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);

        this.displayFleetStates(fleetMarker, sortedPointsX, sortedPointsY, group, fleetSharkID);

        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];

        let text: Text = group!.text(fleetSharkText)
            .x(xText[0])
            .y(yText[1])
            .addClass("fleet-text")
            .id(fleetSharkID + "-txt")
            .click(this.clickEventForFleetGroup)
            .dblclick((event: PointerEvent) => {
                dblClickForFleet(event, fleetOrbit);
            });

        this.canvas?.add(group!);
        this.fleetTextsById.set(fleetSharkID + "-txt", text);
        this.fleetsByText.set(text, fleetMarker);
        this.fleetOwnerByText.set(text, fleetMarker.owner);
        return group;
    }

    protected getOrbitID(orbit: Orbit): string {
        return this.ORBIT_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
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
                .circle(5)
                .addClass("stroke-outline")
                .x(xMarker[0] - 2.5)
                .y(yMarker[1] - 2.5)
                .mouseover(this.mouseoverForMarker)
                .mouseleave(this.mouseleaveForMarker);

            cssClasses.forEach(c => group!.addClass(c));

            let text: Text = new Text().text(txt)
                .x(xMarker[0] - 2.5)
                .y(yMarker[1] - 2.5)
                .addClass("marker-text")
                .id(fleetSharkID + "-txt");

            this.markerTextsById.set(fleetSharkID + "-txt", text);
        }
    }

    protected getFleetSharkID(fleet: Fleet | AbstractId | FleetMarker): string {
        let prefix: string = this.FLEET_SHARK_SELECTOR_ID_PREFIX;
        let id;
        if ('fleet' in fleet) {
            id = fleet.fleet.id;
        }
        if ('id' in fleet) {
            id = fleet.id;
        }
        if ('idFleet' in fleet) {
            id = fleet.idFleet;
        }
        return prefix + "-" + id;
    }

    protected getWarshipID(warShip: WarShip | AbstractId): string {
        let prefix: string = this.WARSHIP_SELECTOR_ID_PREFIX;
        let id = 'id' in warShip ? warShip.id : warShip.idWarship
        return prefix + "-" + id;
    }

    protected getMissileSalvoID(missileMovement: MissileMovement): string {
        let id: string = this.MISSILE_SALVO_SELECTOR_ID_PREFIX;
        return id + "-" + missileMovement.movingMissileSalvo + "-" + missileMovement.combatRoundKey.combatRound.no;
    }

    protected getMissileSalvoIDByHit(hit: CounterMissileHit) {
        let id: string = this.MISSILE_SALVO_SELECTOR_ID_PREFIX;
        return id + "-" + hit.attackedMissileSalvo + "-" + hit.combatRoundKey.combatRound.no;
    }

    protected getCelestialBodyID(orbit: Orbit): string {
        return this.CELESTIAL_BODY_SELECTOR_ID_PREFIX + "-" + orbit.xCoordinate.coordinate + "-" + orbit.yCoordinate.coordinate;
    }

    protected getOrbitOfCelestialByID(id: string): Orbit | undefined {
        return this.celestialOrbitById.get(id);
    }

    protected getOrbitOfOrbitByID(id: string): Orbit | undefined {
        return this.orbitsById.get(id);
    }

    protected getFleetTextByID(id: string): Text | undefined {
        return this.fleetTextsById.get(id);
    }

    protected getFleetByText(text: Text): FleetMarker | undefined {
        return this.fleetsByText.get(text);
    }

    protected getFleetByID(id: string): FleetMarker | undefined {
        return this.fleetsById.get(id);
    }

    protected getFleetByGroupID(id: string): FleetMarker | undefined {
        let reducedId = id.replace(BasicViewHelper.GROUP_SELECTOR_SUFFIX, "");
        return this.getFleetByID(reducedId);
    }

    protected getCelestialByEvent(event: PointerEvent | MouseEvent): Circle | undefined {
        let id = this.getIdFromEvent(event);
        return this.getCelestialByID(id);
    }

    protected getCelestialByID(id: string): Circle | undefined {
        return this.celestialBodyById.get(id);
    }

    protected getCelestialObjectByID(id: string): Planet | StarSystem | undefined {
        return this.celestialObjectById.get(id);
    }

    protected getFleetSharkByID(id: string): Polygon | undefined {
        return this.fleetPolygonsById.get(id);
    }

    protected getOrbitOfCelestialByEvent(event: PointerEvent | MouseEvent): Orbit | undefined {
        let id = this.getIdFromEvent(event);
        return this.getOrbitOfCelestialByID(id);
    }

    protected getOrbitTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        const byEvent = this.getOrbitOfCelestialByEvent(event);
        if (!byEvent) {
            return undefined;
        }
        const orbitID = this.getOrbitID(byEvent);
        return this.getOrbitTextByID(orbitID);
    }

    protected getOrbitTextByID(id: string): Text | undefined {
        return this.orbitTextsById.get(id);
    }

    protected getMarkerTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let id = this.getIdFromEvent(event);
        id = id.replace("group", "txt");
        return this.markerTextsById.get(id);
    }

    protected getOwnerByID(id: string): AbstractId | undefined {
        return this.fleetOwnersById.get(id);
    }

    protected getFleetOwnerByGroupID(id: string): AbstractId | undefined {
        let reducedId = id.replace(BasicViewHelper.GROUP_SELECTOR_SUFFIX, "");
        return this.getOwnerByID(reducedId);
    }

    protected getFleetOwnerByText(text: Text): AbstractId | undefined {
        return this.fleetOwnerByText.get(text);
    }

    protected getFleetByEvent(event: PointerEvent | MouseEvent | any): FleetMarker | undefined {
        let id = this.getIdFromEvent(event);
        return this.getFleetByID(id);
    }

    private getIdFromEvent(event: PointerEvent | MouseEvent | any) {
        let target: Shape = event.target as Shape;
        const id = target.id as unknown as string;
        if (!id) {
            const parent = event.path[1];
            return parent.id;
        }
        return id;
    }

    protected getFleetOwnerForOwnerByEvent(event: PointerEvent | MouseEvent): AbstractId | undefined {
        let id = this.getIdFromEvent(event);
        return this.getOwnerByID(id);
    }

    protected getFleetTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let p = event.composedPath()[1];
        let x = <HTMLElement>p;
        return this.getFleetTextByID(x.id);
    }

    protected getWarshipByID(id: string): AbstractId | undefined {
        return this.warshipsById.get(id);
    }

    protected getWarshipByEvent(event: PointerEvent | MouseEvent | any): AbstractId | undefined {
        let id = this.getIdFromEvent(event);
        return this.getWarshipByID(id);
    }

    protected getWarshipTextByEvent(event: PointerEvent | MouseEvent): Text | undefined {
        let p = event.composedPath()[1];
        let x = <HTMLElement>p;
        return this.getWarshipTextByID(x.id);
    }

    protected getWarshipTextByID(id: string): Text | undefined {
        return this.warshipTextsById.get(id);
    }

    protected getWarshipByText(text: Text): AbstractId | undefined {
        return this.warshipsByText.get(text);
    }
}
