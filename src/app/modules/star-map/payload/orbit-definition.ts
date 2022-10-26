import {Orbit, Planet, StarSystem} from "../../../services/swagger";

/**
 * just a container to hold the orbit information and if the specified orbit is colonized by someone
 */
export class OrbitDefinition {

    readonly celestial: Planet | StarSystem;

    readonly name: string;

    readonly orbit: Orbit;

    readonly isColonizedByLoggedInUser: boolean;

    readonly isColonizedByOtherUser: boolean;

    readonly isColonizable: boolean;

    readonly isMain: boolean;

    constructor(celestial: Planet | StarSystem,
                isColonizedByLoggedInUser: boolean,
                isColonizedByOtherUser: boolean,
                isColonizable: boolean,
                isMain: boolean) {
        this.celestial = celestial;
        this.name = celestial.name;
        this.orbit = celestial.orbit;
        this.isColonizedByLoggedInUser = isColonizedByLoggedInUser;
        this.isColonizedByOtherUser = isColonizedByOtherUser;
        this.isColonizable = isColonizable;
        this.isMain = isMain;
    }

    public static getOrbitDefinitionsForStarSystem(userId: number, systems: StarSystem[]): OrbitDefinition[] {
        const od: OrbitDefinition[] = [];
        systems.forEach(system => {
            let isColonizedByLoggedInUser: boolean = false;
            let isColonizedByOtherUser: boolean = false;
            let isColonizable: boolean = false;
            let isMain: boolean = false;
            system.planets.forEach(planet => {
                if (!!planet.owner) {
                    if (planet.owner.idUser == userId) {
                        isColonizedByLoggedInUser = true;
                        if (planet.isMain) {
                            isMain = true
                        }
                    } else {
                        isColonizedByOtherUser = true;
                    }
                } else {
                    isColonizable = true;
                }
            });
            od.push(new OrbitDefinition(system, isColonizedByLoggedInUser, isColonizedByOtherUser, isColonizable, isMain));
        });
        return od;
    }

    public static getOrbitDefinitionsForPlanet(userId: number, planets: Planet[]): OrbitDefinition[] {
        const od: OrbitDefinition[] = [];
        planets.forEach(planet => {
            let isColonizedByLoggedInUser: boolean = false;
            let isColonizedByOtherUser: boolean = false;
            let isColonizable: boolean = false;
            let isMain: boolean = false;
            if (!!planet.owner) {
                if (planet.owner.idUser == userId) {
                    isColonizedByLoggedInUser = true;
                    if (planet.isMain) {
                        isMain = true
                    }
                } else {
                    isColonizedByOtherUser = true;
                }
            } else {
                isColonizable = true;
            }
            od.push(new OrbitDefinition(planet, isColonizedByLoggedInUser, isColonizedByOtherUser, isColonizable, isMain));
        });
        return od;
    }
}
