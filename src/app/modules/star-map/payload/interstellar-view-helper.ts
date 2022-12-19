import {Path, Svg} from "@svgdotjs/svg.js";
import {Distance, FleetMarker, Move, Orbit} from "../../../services/swagger";
import {OrbitDefinition} from "./orbit-definition";
import {TokenStorage} from "../../../services/authentication/token-storage.service";
import {BasicViewHelper} from "../../../basic-view-helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

export class InterstellarViewHelper extends BasicViewHelper {

    public static readonly STANDARD_METRIC = DistanceMetricEnum.LY;

    constructor(tokenStorage: TokenStorage) {
        super(tokenStorage, InterstellarViewHelper.STANDARD_METRIC);
    }

    setFleetsInInterstellarMotion(fleetsInMotion: FleetMarker[]) {
        fleetsInMotion.forEach(fleetMarker => {
            let {color, arr} = this.createInterstellarCoursePlot(fleetMarker.move!);
            let path = new Path().plot(arr).fill(BasicViewHelper.NONE_FILL_COLOR).stroke({color: color, width: 1});

            let startOrbit = fleetMarker.move!.startOrbit.system!.orbit;
            let targetOrbit = fleetMarker.move!.targetOrbit.system!.orbit;
            let distance = this.calculateDistanceOfOrbits(startOrbit, targetOrbit);
            let part = (fleetMarker.move!.originalDuration - fleetMarker.move!.moveDoneAtZero) / fleetMarker.move!.originalDuration;
            let coveredTrackLength = distance * part;
            let pointAt = path.pointAt(coveredTrackLength);
            let orbit: Orbit = {
                xCoordinate: {
                    coordinate: pointAt.x,
                    distanceMetric: InterstellarViewHelper.STANDARD_METRIC
                },
                yCoordinate: {
                    coordinate: pointAt.y,
                    distanceMetric: InterstellarViewHelper.STANDARD_METRIC
                }
            }
            fleetMarker.orbit = {
                orbit: orbit
            }
            this.createFleetGroup(fleetMarker, pointAt.x, pointAt.y, orbit);
        });
    }

    setFleets(fleetMarkers: FleetMarker[]) {

        const moving = fleetMarkers.filter(f => !!f.move);
        this.setFleetsInInterstellarMotion(moving); // fixme get same positions for fleet sharks and draw collection icon -> fan out/in on zoom

        const fleetsInSameSystem = new Map<number, FleetMarker[]>();
        const immobile = fleetMarkers.filter(f => !f.move);
        immobile.forEach(fleetMarker => {
            const system = fleetMarker.orbit!.system;
            let markers = fleetsInSameSystem.get(system!.idStarSystem!);
            if (!markers) {
                markers = [];
            }
            markers.push(fleetMarker);
            fleetsInSameSystem.set(system!.idStarSystem!, markers);
        });

        for (let inSameSystem of fleetsInSameSystem.values()) {
            if (inSameSystem.length > 1) {
                this.createFleetCollection(inSameSystem); // fixme set restriction boxes for whole map and fill with fleets -> is more than one show fleet collection and so on
            } else {
                const fleetMarker = inSameSystem[0];
                const system = fleetMarker.orbit?.system;
                const orbit = system!.orbit;
                this.createFleetGroup(fleetMarker, orbit.xCoordinate.coordinate, orbit.yCoordinate.coordinate, orbit);
            }
        }
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

    drawOrbits(canvas: Svg,
               orbits: OrbitDefinition[]) {
        this.setCanvas(canvas);
        this.setOrbits(orbits);
        this.sortByOrbit();
        this.createPolarCoordinateSystem();
        const homeDef = orbits.filter(od => od.isMain)[0];
        this.setViewBox(homeDef.orbit, 0.2);

        orbits.forEach(orbitDefinition => this.drawCelestial(orbitDefinition));
    }
}
