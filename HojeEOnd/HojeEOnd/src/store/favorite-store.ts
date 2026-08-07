import { create } from "zustand";


type FavoriteStore = {

  favorites: string[];

  addFavorite: (id: string) => void;

  removeFavorite: (id: string) => void;

  isFavorite: (id: string) => boolean;

};



export const useFavoriteStore = create<FavoriteStore>((set, get) => ({

  favorites: [],


  addFavorite: (id: string) =>

    set((state) => ({

      favorites: [
        ...state.favorites,
        id
      ]

    })),



  removeFavorite: (id: string) =>

    set((state) => ({

      favorites:
        state.favorites.filter(
          item => item !== id
        )

    })),



  isFavorite: (id: string) =>

    get()
      .favorites
      .includes(id),


}));