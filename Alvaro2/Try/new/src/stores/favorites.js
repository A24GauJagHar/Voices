import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favoritesList: []
  }),
  actions: {
    addFavorite(drink) {
      const exists = this.favoritesList.find(d => d.idDrink === drink.idDrink)
      if (!exists) {
        this.favoritesList.push(drink)
        alert(`${drink.strDrink} afegit!`)
      }
    }
  }
})
