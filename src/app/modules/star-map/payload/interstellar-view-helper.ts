import {ArrayXY, Svg} from "@svgdotjs/svg.js";
import {Distance, FleetDistributionPerUser, FleetMarker, FleetOrbit, Move} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {BasicViewHelper} from "../../../basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class InterstellarViewHelper extends BasicViewHelper {

    public static readonly STANDARD_METRIC = DistanceMetricEnum.LY;

    constructor(tokenStorage: TokenStorage) {
        super(tokenStorage, InterstellarViewHelper.STANDARD_METRIC);
    }

    setFleetsInInterstellarMotion(canvas: Svg,
                                  fleetsInMotion: FleetMarker[],
                                  dblClickForFleet: (event: PointerEvent) => void) {
        fleetsInMotion.forEach(fleetMarker => {
            let {color, arr} = this.createInterstellarCoursePlot(fleetMarker.move!);
            let path = this.canvas!.path(arr).fill(BasicViewHelper.NONE_FILL_COLOR).stroke({color: color, width: 1});
            this.canvas?.removeElement(path);

            const fleetOrbit = undefined;
            let startOrbit = fleetMarker.move!.startOrbit.system!.orbit;
            let targetOrbit = fleetMarker.move!.targetOrbit.system!.orbit;
            let distance = this.calculateDistanceOfOrbits(startOrbit, targetOrbit);
            let part = (fleetMarker.move!.originalDuration - fleetMarker.move!.moveDoneAtZero) / fleetMarker.move!.originalDuration;
            let coveredTrackLength = distance * part;
            let pointAt = path.pointAt(coveredTrackLength);

            let fleetSharkPoints: ArrayXY[] = this.defineFleetSharkPoints(pointAt.x, pointAt.y);
            this.createFleetGroup(fleetMarker, fleetSharkPoints, dblClickForFleet, fleetOrbit);
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

    setFleetsAtSystem(canvas: Svg,
                      fleetDistributionPerUsers: FleetDistributionPerUser[],
                      dblClickForFleet: (event: PointerEvent, fleetOrbit: FleetOrbit | undefined) => void) {
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
                this.createFleetGroup(fleetMarker, fleetSharkPoints, dblClickForFleet, {system: system});
            });
        });
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
