import { Component } from "@angular/core";

import { HomesGridComponent } from "../homes-grid/homes-grid.component";
import { FavoriteHomesComponent } from "../favorite-homes/favorite-homes.component";
import { PaginationComponent } from "../pagination/pagination.component";
import { FilterHomesComponent } from "../filter-homes/filter-homes.component";

@Component({
  selector: "app-home-list",
  imports: [HomesGridComponent, FavoriteHomesComponent, PaginationComponent, FilterHomesComponent],
  templateUrl: "./home-list.component.html",
  styleUrl: "./home-list.component.css",
})
export class HomeListComponent {}