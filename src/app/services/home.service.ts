import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, computed, signal } from "@angular/core";
import { Home } from "../models/home.type";
import { finalize } from "rxjs/operators";
import { HomeFilter } from "../models/filter.type";
import { Observable } from "rxjs";
const API_URL = "http://localhost:3000/homes";

type PaginatedResponse<T> = {
  data: T;
  pages: number;
  items: number;
};

@Injectable({
  providedIn: "root",
})
export class HomeService {
  paginatedHomes = signal<Home[]>([]);
  favoritesHomes = signal<Home[]>([]);
  totalHomes = signal<number>(0);
  totalPages = signal<number>(0);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);


  activeFilter = signal<HomeFilter>({});

  constructor(private http: HttpClient) {
    this.loadFavoritesFromStorage();
  }

  fetchHomes(page: number = 1, limit: number = 6) {
    let params = new HttpParams().set("_page", page.toString()).set("_per_page", limit.toString());

    // Add filter parameters
    const filter = this.activeFilter();
    if (filter.city) {
      params = params.set("city", filter.city);
    }
    if (filter.rooms) {
      params = params.set("rooms_gte", filter.rooms.toString());
    }
    if (filter.bathrooms) {
      params = params.set("bathrooms_gte", filter.bathrooms.toString());
    }
    if (filter.hasPool !== undefined) {
      params = params.set("hasPool", filter.hasPool.toString());
    }

    this.isLoading.set(true);
    return this.http
      .get<PaginatedResponse<Home[]>>(API_URL, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.paginatedHomes.set(this.addFavoriteStatus(response.data));

          this.totalHomes.set(response.items);
          this.totalPages.set(response.pages);
        },
        error: (error) => {
          this.error.set(error.message);
        },
      });
  }

  toggleFavorite(favoriteHome: Home) {
    if (this.isHomeAfavorite(favoriteHome)) {
       this.favoritesHomes.set(this.favoritesHomes().filter((home) => home.id !== favoriteHome.id));
    } else {
      let oldFavorites = this.favoritesHomes()
      oldFavorites.push(favoriteHome);
      oldFavorites.map((home)=>{
        home.isFavorite = true;
        return home;
      })
      this.favoritesHomes.set(oldFavorites);
    }
    this.saveFavoritesToStorage();
    

    this.paginatedHomes.update(
      (homes) => this.addFavoriteStatus(homes)
    )

  }

  private loadFavoritesFromStorage(): Home[] {
    const favorites = localStorage.getItem("favorites");
    if (favorites) {
      const parsedFavorites = JSON.parse(favorites) as Home[];
      this.favoritesHomes.set(parsedFavorites);
      return parsedFavorites;
    }
    return [];
  }

  private addFavoriteStatus(homes: Home[]): Home[] {
    return homes.map((home)=>{
      
      return {...home,isFavorite:this.isHomeAfavorite(home)}
    });
  }

  private saveFavoritesToStorage(): void {
    try {
      localStorage.setItem("favorites", JSON.stringify(this.favoritesHomes()));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }

  // Helper method to apply filter to an array of homes
  private applyFilterToHomes(homes: Home[], filter: HomeFilter): Home[] {
    return homes.filter((home) => {
      if (filter.city && home.city !== filter.city) return false;
      if (filter.rooms && home.rooms < filter.rooms) return false;
      if (filter.bathrooms && home.bathrooms < filter.bathrooms) return false;
      if (filter.hasPool !== undefined && home.hasPool !== filter.hasPool) return false;
      return true;
    });
  }

  setFilter(filter: HomeFilter): void {
    this.activeFilter.set(filter);

    // Also filter the favorites
    const allFavorites = this.loadFavoritesFromStorage();
    const filteredFavorites = this.applyFilterToHomes(allFavorites, filter);
    this.favoritesHomes.set(filteredFavorites);
  }

  getHomeById(id: number): Observable<Home> {
    return this.http.get<Home>(`${API_URL}/${id}`);
  }

  updateHome(id: number, home: Partial<Home>): Observable<Home> {
    return this.http.put<Home>(`${API_URL}/${id}`, home);
  }

  createHome(home: Omit<Home, "id">): Observable<Home> {
    return this.http.post<Home>(`${API_URL}/`, home);
  }

  private isHomeAfavorite(home: Home) : boolean{
    for (let i=0;i<this.favoritesHomes().length;i++){
      if (this.favoritesHomes()[i].id === home.id){
        return true;
      }
    }
    return false;
  }
}