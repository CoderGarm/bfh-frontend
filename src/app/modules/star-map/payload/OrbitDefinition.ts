import {Orbit, Planet, StarSystem} from "../../../services/swagger";

/**
 * just a container to hold the orbit information and if the specified orbit is colonized by someone
 */
export class OrbitDefinition {

    readonly orbit: Orbit;

    readonly isColonizedByLoggedInUser: boolean;

    readonly isColonizedByOtherUser: boolean;

    readonly isColonizable: boolean;

    constructor(orbit: Orbit, isColonizedByLoggedInUser: boolean, isColonizedByOtherUser: boolean, isColonizable: boolean) {
        this.orbit = orbit;
        this.isColonizedByLoggedInUser = isColonizedByLoggedInUser;
        this.isColonizedByOtherUser = isColonizedByOtherUser;
        this.isColonizable = isColonizable;
    }

    public static getOrbitDefinitionsForUniverse(userId: number, systems: StarSystem[]): OrbitDefinition[] {
        const od: OrbitDefinition[] = [];
        systems.forEach(system => {
            let isColonizedByLoggedInUser: boolean = false;
            let isColonizedByOtherUser: boolean = false;
            let isColonizable: boolean = false;
            system.planets.forEach(planet => {
                if (!!planet.owner) {
                    if (planet.owner.idUser == userId) {
                        isColonizedByLoggedInUser = true;
                    } else {
                        isColonizedByOtherUser = true;
                    }
                } else {
                    isColonizable = true;
                }
            });
            od.push(new OrbitDefinition(system.orbit, isColonizedByLoggedInUser, isColonizedByOtherUser, isColonizable));
        });
        return od;
    }

    public static getOrbitDefinitionsForStarSystem(userId: number, planets: Planet[]): OrbitDefinition[] {
        const od: OrbitDefinition[] = [];
        planets.forEach(planet => {
            let isColonizedByLoggedInUser: boolean = false;
            let isColonizedByOtherUser: boolean = false;
            let isColonizable: boolean = false;
            if (!!planet.owner) {
                if (planet.owner.idUser == userId) {
                    isColonizedByLoggedInUser = true;
                } else {
                    isColonizedByOtherUser = true;
                }
            } else {
                isColonizable = true;
            }
            od.push(new OrbitDefinition(planet.orbit, isColonizedByLoggedInUser, isColonizedByOtherUser, isColonizable));
        });
        return od;
    }
}
