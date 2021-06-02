Vue.use(ShopifyProducts);

const store = new Vuex.Store({
  state: {
    products: {}
  },

  mutations: {
    products(state, payload) {
      state.products = payload;
    }
  }
});

const router = new VueRouter({
  routes: [
    {
      path: '/product/:slug',
      component: ProductPage
    },

    {
      path: '/404',
      alias: '*',
      component: PageNotFound
    }
  ]
});

new Vue({
  el: '#app',

  store,
  router,

  created() {
    CSV.fetch({url: './data/csv-files/bicycles.csv'}).then(data => {
      this.$store.commit('products', this.$formatProducts(data));
    });
  }
});
