import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { LucideAngularModule, WavesLadder, Bed, Bath, MapPin, Heart } from "lucide-angular";

import { Home } from "../models/home.type";

/**
 * Component for displaying a single home card
 * This is a presentational component that receives a Home object via @Input
 */
@Component({
  selector: "app-home-card",
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: "./home-card.component.html",
  styleUrls: ["./home-card.component.css"],
})
export class HomeCardComponent {
  @Input() home!: Home;
  @Output() toggleFavorite = new EventEmitter<number>();

  readonly WavesLadderIcon = WavesLadder;
  readonly BedIcon = Bed;
  readonly BathIcon = Bath;
  readonly MapPin = MapPin;
  readonly Heart = Heart;

  /**
   * Emit the home id when favorite is toggled
   */
  onFavoriteClick(): void {
    if (this.home.id) {
      this.toggleFavorite.emit(this.home.id);
    }
  }
}