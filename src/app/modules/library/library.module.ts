import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LibraryTabViewComponent} from './orga/library-main-view/library-tab-view.component';
import {LibraryModuleDisplayComponent} from './payload/library-module-display/library-module-display.component';
import {MatTabsModule} from "@angular/material/tabs";
import {TranslateModule} from "@ngx-translate/core";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {MatListModule} from "@angular/material/list";
import {LibraryBuildingDisplayComponent} from './payload/library-building-display/library-building-display.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {LibraryOrbitalModuleDisplayComponent} from './payload/library-orbital-module-display/library-orbital-module-display.component';


@NgModule({
  declarations: [
    LibraryTabViewComponent,
    LibraryModuleDisplayComponent,
      LibraryBuildingDisplayComponent,
      LibraryOrbitalModuleDisplayComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    TranslateModule,
    DisplayElementsModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    SharedModuleModule
  ]
})
export class LibraryModule {
}
