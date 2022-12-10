import {ArrayXY, StrokeData, Svg, Text} from "@svgdotjs/svg.js";
import {AbstractId, Distance, FleetDistributionPerUser, FleetMarker, FleetOrbit, Move, Orbit, StarSystem} from "../../../services/swagger";
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
                                  fleetsInMotion: Map<Move, FleetMarker[]>,
                                  dblClickForFleet: (event: PointerEvent) => void) {
        fleetsInMotion.forEach((fleets, move) => {

            let {color, arr} = this.createInterstellarCoursePlot(move);

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

    private createInterstellarCoursePlot(move: Move) {
        if (!move.startOrbit.orbit || !move.startOrbit.system || !move.targetOrbit.orbit || !move.targetOrbit.system) {
            throw new Error("The move should have a origin and a destination.");
        }

        const xOrigin = move.startOrbit.system.orbit.xCoordinate;
        const yOrigin = move.startOrbit.system.orbit.yCoordinate;
        const xDestination = move.targetOrbit.system.orbit.xCoordinate;
        const yDestination = move.targetOrbit.system.orbit.yCoordinate;

        return this.createCoursePlot(xOrigin, yOrigin, xDestination, yDestination);
    }

    private createFleetSharkInterstellarMotionAndPrint(fleetSharkID: string,
                                                       fleetSharkPoints: ArrayXY[],
                                                       dblClickForFleet: (event: PointerEvent) => void,
                                                       fleet: FleetMarker) {
        let sd: StrokeData = {
            color: "black",
            width: 1
        }

        let group = this.canvas?.group()
            .id(fleetSharkID + "-group");

        this.groupsByID.set(fleetSharkID + "-group", group!);

        let userID = this.tokenStorage.getUserID();
        let fleetSharkColor = this.FLEET_SHARK_COLOR_HOSTILE;
        if (fleet.owner.id == userID) {
            fleetSharkColor = this.FLEET_SHARK_COLOR_OWN;
        }
        group!.polygon(fleetSharkPoints).fill(fleetSharkColor).stroke(sd).id(fleetSharkID).dblclick(dblClickForFleet);

        let sortedPointsX = fleetSharkPoints.sort((a, b) => a[0] > b[0] ? 1 : -1);
        let sortedPointsY = fleetSharkPoints.sort((a, b) => a[1] < b[1] ? 1 : -1);
        let xText = sortedPointsX[sortedPointsX.length - 1];
        let yText = sortedPointsY[0];

        let text: Text = group!.text(fleet.owner.name!)
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
                      dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void,
                      dragEndForFleet: (draggedFleet?: AbstractId, fromSystem?: StarSystem, targetOrbit?: Orbit) => void) {
        this.setCanvas(canvas);

        fleetDistributionPerUsers.forEach(fd => {
            const system = fd.starSystem;
            const orbit = system.orbit;
            const fleetMarkers = fd.fleetMarker;
            fleetMarkers.forEach(fleetMarker => {
                const positionShift = fleetMarkers.indexOf(fleetMarker);
                let x: number = this.convertToStandardMetric(orbit.xCoordinate) + 25 + (positionShift % 2 == 0 ? 15 : 0);
                let y: number = this.convertToStandardMetric(orbit.yCoordinate) + 25;
                let fleetSharkPoints: ArrayXY[] = this.createFleetSharkPoints(x, y, orbit);
                this.createFleetSharkAndPrintAtSystem(system, fleetMarker, dragEndForFleet, dblClickForFleet, fleetSharkPoints);
            });
        });
    }

    private createFleetSharkAndPrintAtSystem(system: StarSystem,
                                             fleetMarker: FleetMarker,
                                             dragEndForFleet: (draggedFleet?: AbstractId, fromSystem?: StarSystem, targetOrbit?: Orbit) => void,
                                             dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void,
                                             fleetSharkPoints: ArrayXY[]) {

        const fleetSharkText = fleetMarker.owner.name!;
        const canBeDragged = fleetMarker.state.isActive;
        const userIsOwner = fleetMarker.owner.id == this.tokenStorage.getUserID();

        let group = this.createFleetGroup(fleetMarker, userIsOwner, fleetSharkPoints, dblClickForFleet, {system: system}, fleetSharkText);

        if (userIsOwner && canBeDragged) {
            group!.draggable(true).on('dragend', this.dragEndFleetGroupAtSystem(system, dragEndForFleet));
        }
    }

    private dragEndFleetGroupAtSystem(system: StarSystem, dragEndForFleet: (fleetOwner?: AbstractId, system?: StarSystem, orbit?: Orbit) => void) {
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
                if (!!orbit) {
                    dragEndForFleet(fleetOwner, system, orbit);
                }
                return;
            }
        };
    }

    setOrbits(canvas: Svg,
              orbits: OrbitDefinition[]) {
        this.setCanvas(canvas);
        this.orbits = orbits.map(od => od.orbit);
        this.sortByOrbit();
        this.createPolarCoordinateSystem();
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.orbit, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition));
    }
}
