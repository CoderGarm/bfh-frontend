import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {StarMapComponent} from './star-map/star-map.component';
import {StarMapViewComponent} from './star-map-view/star-map-view.component';
import {UniverseMapViewComponent} from './universe-map-view/universe-map-view.component';


@NgModule({
  declarations: [
    StarMapComponent,
    StarMapViewComponent,
    UniverseMapViewComponent
  ],
  imports: [
    SharedModuleModule
  ]
})
export class StarMapModule {
}
