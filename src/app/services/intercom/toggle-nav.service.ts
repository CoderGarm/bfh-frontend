import {Injectable} from '@angular/core';

/**
 * If scroll must be hidden at mat drawer for a specific component.
 */
@Injectable()
export class ToggleNavService {

    navOpened: boolean = true;
}
