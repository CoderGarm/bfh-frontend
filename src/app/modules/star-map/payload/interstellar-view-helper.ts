import {ArrayXY, CurveCommand, LineCommand, PathArrayAlias, StrokeData, Svg, Text} from "@svgdotjs/svg.js";
import {Distance, Fleet, FleetDistributionPerUser, FleetMarker, Move, Orbit, StarSystem, UserJson} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {BasicViewHelper} from "../../../basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class InterstellarViewHelper extends BasicViewHelper {

    public static readonly STANDARD_METRIC = DistanceMetricEnum.LY;

    constructor(protected tokenStorage: TokenStorage) {
        super(InterstellarViewHelper.STANDARD_METRIC);
    }

    setFleetsInInterstellarMotion(canvas: Svg,
                                  fleetsInMotion: Map<Move, Fleet[]>,
                                  dblClickForFleet: (event: PointerEvent) => void) {
        fleetsInMotion.forEach((fleets, move) => {

            let {color, arr} = this.createCoursePlotForInterstellarMotion(move);

            let path = this.canvas!.path(arr).fill("none").stroke({color: color, width: 1});
            fleets.forEach(fleet => {

                let startOrbit = fleet.move!.startOrbit.system!.orbit;
                let targetOrbit = fleet.move!.targetOrbit.system!.orbit;
                let distance = this.calculateDistanceOfOrbits(startOrbit, targetOrbit);

                let part = (fleet.move!.originalDuration - fleet.move!.moveDoneAtZero) / fleet.move!.originalDuration;
                if (part < 0.1) {
                    part = 0.1;
                } else if (part > 0.9) {
                    part = 0.9;
                }
                let coveredTrackLength = distance * part;

                let pointAt = path.pointAt(coveredTrackLength);

                let fleetSharkPoints: ArrayXY[] = this.defineFleetSharkPoints(pointAt.x, pointAt.y);
                let fleetSharkID = this.getFleetSharkID(fleet);
                this.fleetsById.set(fleetSharkID, fleet);
                this.createFleetSharkInterstellarMotionAndPrint(fleetSharkID, fleetSharkPoints, dblClickForFleet, fleet);
            });
        });
    }

    private createCoursePlotForInterstellarMotion(move: Move) {
        // todo check start planet's orbit
        let startX: number = this.convertToStandardMetric(move.startOrbit.system!.orbit.xCoordinate);
        let startY: number = this.convertToStandardMetric(move.startOrbit.system!.orbit.yCoordinate);

        let endX: number = this.convertToStandardMetric(move.targetOrbit.system!.orbit.xCoordinate);
        let endY: number = this.convertToStandardMetric(move.targetOrbit.system!.orbit.yCoordinate);

        let relativeTargetX: number = endX - startX;
        let relativeTargetY: number = endY - startY;

        let baseQx: number = 30;
        let baseQy: number = 50;

        let qXMultiplier: number = 1;
        let qYMultiplier: number = 1;
        if (relativeTargetY < 0) {
            // cY is negative if the movement on y-axis is inbound
            qYMultiplier = -1;
        }

        let color: string;
        if (BasicViewHelper.calculateDistance(startX, startY) <= BasicViewHelper.calculateDistance(endX, endY)) {
            color = this.COURSE_PLOT_COLOR_OUTBOUND;
            // outbound cX is negative
            qXMultiplier = -1;
        } else {
            color = this.COURSE_PLOT_COLOR_INBOUND;
        }

        let cX: number = qXMultiplier * baseQx;
        let cY: number = qYMultiplier * baseQy;

        let p1: LineCommand = ["M", startX, startY];
        let p2: CurveCommand = ["q", cX, cY, relativeTargetX, relativeTargetY];

        let arr: PathArrayAlias = [p1, p2];
        return {color, arr};
    }

    private createFleetSharkInterstellarMotionAndPrint(fleetSharkID: string,
                                                       fleetSharkPoints: ArrayXY[],
                                                       dblClickForFleet: (event: PointerEvent) => void,
                                                       fleet: Fleet) {
        let sd: StrokeData = {
            color: "black",
            width: 1
        }

        let group = this.canvas?.group()
            .id(fleetSharkID + "-group");

        this.groupsByID.set(fleetSharkID + "-group", group!);

        let userID = this.tokenStorage.getUserID();
        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (fleet.owner.idUser == userID) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        group!.polygon(fleetSharkPoints).fill(fleetSharkColor).stroke(sd).id(fleetSharkID).dblclick(dblClickForFleet);

        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);
        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];

        let text: Text = group!.text(fleet.owner.username)
            .x(xText[0])
            .y(yText[1])
            .addClass("fleet-text")
            .id(fleetSharkID + "-txt")
            .dblclick(dblClickForFleet);

        this.canvas?.add(group!);
        this.fleetsByText.set(text, fleet);
        this.fleetTextsById.set(fleetSharkID + "-txt", text);
    }

    setFleetsAtSystem(canvas: Svg,
                      fleetDistributionPerUsers: FleetDistributionPerUser[],
                      dblClickForFleet: (event: PointerEvent, system: StarSystem) => void,
                      dragEndForFleet: (draggedFleet?: UserJson, fromSystem?: StarSystem, targetOrbit?: Orbit) => void) {
        this.setCanvas(canvas);

        fleetDistributionPerUsers.forEach(fd => {
            const system = fd.starSystem;
            const orbit = system.orbit;
            const users = fd.users;
            const fleetMarkers = fd.fleetMarker;
            fleetMarkers.forEach(fleetMarker => {
                const positionShift = fleetMarkers.indexOf(fleetMarker);
                const owner = users.filter(u => u.idUser == fleetMarker.owner.id)[0];

                let x: number = this.convertToStandardMetric(orbit.xCoordinate) + 25 + (positionShift % 2 == 0 ? 15 : 0);
                let y: number = this.convertToStandardMetric(orbit.yCoordinate) + 25;
                let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);
                this.createFleetSharkAndPrintAtSystem(system, owner, fleetMarker, dragEndForFleet, dblClickForFleet, fleetSharkPoints);
            });
        });
    }

    private createFleetSharkAndPrintAtSystem(system: StarSystem,
                                             owner: UserJson,
                                             fleetMarker: FleetMarker,
                                             dragEndForFleet: (draggedFleet?: UserJson, fromSystem?: StarSystem, targetOrbit?: Orbit) => void,
                                             dblClickForFleet: (event: PointerEvent, system: StarSystem) => void,
                                             fleetSharkPoints: ArrayXY[]) {

        let fleetSharkID = this.getFleetSharkIdByFleetMarker(fleetMarker);
        this.fleetOwnersById.set(fleetSharkID, owner);

        let sd: StrokeData = {
            color: "black",
            width: 1
        }

        let group = this.canvas?.group()
            .id(fleetSharkID + "-group");

        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;

        let userID = this.tokenStorage.getUserID();
        if (userID == owner.idUser && fleetMarker.state.isActive) {
            group!
                .draggable(true)
                .on('dragend', this.dragEndFleetGroupAtSystem((draggedUser, targetOrbit) => {
                    if (!!targetOrbit) {
                        dragEndForFleet(draggedUser, system, targetOrbit)
                    }
                }));
        }
        if (userID == owner.idUser) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }

        this.groupsByID.set(fleetSharkID + "-group", group!);

        group!
            .polygon(fleetSharkPoints)
            .fill(fleetSharkColor)
            .stroke(sd)
            .id(fleetSharkID)
            .dblclick((event: PointerEvent) => {
                dblClickForFleet(event, system);
            });

        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);


        if (!fleetMarker.state.isActive) {
            let xMarker = sortedPointsX[0];
            let yMarker = sortedPointsY[sortedPointsY.length - 1];

            const cssActivityMarker = fleetMarker.state.needsRepair ? 'under-construction' : '';
            const cssOperationalMarker = !fleetMarker.state.isOperational ? 'inoperational' : '';

            group!
                .circle(5)
                .stroke(sd)
                .x(xMarker[0] - 2.5)
                .y(yMarker[1] - 2.5)
                .addClass(cssActivityMarker)
                .addClass(cssOperationalMarker)
                .mouseover(this.mouseoverForMarker)
                .mouseleave(this.mouseleaveForMarker);

            let txt = fleetMarker.state.needsRepair ? 'Fleet is in dock' : '';
            txt = !fleetMarker.state.isOperational ? 'Fleet is inoperational' : txt;

            let text: Text = new Text().text(txt)
                .x(xMarker[0] - 2.5)
                .y(yMarker[1] - 2.5)
                .addClass("marker-text")
                .id(fleetSharkID + "-txt");

            this.markerTextsById.set(fleetSharkID + "-txt", text);
        }

        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];

        let text: Text = group!.text(owner.username)
            .x(xText[0])
            .y(yText[1])
            .addClass("fleet-text")
            .id(fleetSharkID + "-txt")
            .dblclick((event: PointerEvent) => {
                dblClickForFleet(event, system);
            });

        this.canvas?.add(group!);
        this.fleetTextsById.set(fleetSharkID + "-txt", text);
        this.fleetOwnerByText.set(text, owner);
    }

    private dragEndFleetGroupAtSystem(dragEndForFleet: (draggedFleetSharkOfUser?: UserJson, orbit?: Orbit) => void) {
        return (e: any) => {
            let target = <SVGGElement>e.target;
            let id: string = target.id;
            let group = this.groupsByID.get(id);
            if (!group) {
                return;
            }
            let fleetOwner = this.getFleetOwnerByGroupID(id);
            if (!fleetOwner) {
                return;
            }
            // detect if dragged fleet is inside a celestial body areaF
            let celestialAreas = this.celestialAreas.filter(a => a.isInside(group!));
            if (celestialAreas.length > 0) {
                let detectedMoveTarget = celestialAreas[0];
                let orbitId = detectedMoveTarget.referenceId;
                let orbit = this.getOrbitOfOrbitByID(orbitId);
                // call callback function
                dragEndForFleet(fleetOwner, orbit);
                return;
            }
        };
    }

    /**
     * starts the complete process of building the canvas and it's attachments
     *
     * @param canvas the canvas to draw at
     * @param orbits all orbits to display
     * @param callbackFunctionForClick the callback function to every orbit
     */
    setOrbits(canvas: Svg, orbits: OrbitDefinition[], callbackFunctionForClick: Function | null) {
        this.setCanvas(canvas);
        this.orbits = orbits.map(od => od.orbit);
        this.sortByOrbit();
        this.createPolarCoordinateSystem();
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.orbit, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition, callbackFunctionForClick));
    }


}
