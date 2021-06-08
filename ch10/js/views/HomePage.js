const HomePage = {
  name: 'HomePage',

  template: `<div>
    <list-products :products="products"></list-products>
  </div>`,

  data() {
    return {
      selectedProducts: [
	'adjustable-stem',
	'colorful-fixie-lima',
	'fizik-saddle-pak',
	'kenda-tube',
	'oury-grip-set',
	'pure-fix-pedals-with-cages'
      ]
    }
  },
  
  computed: {
    products() {
      let products = this.$store.state.products,
	  output = [];

      console.log(products);
      if(Object.keys(products).length) {
	for(let featured of this.selectedProducts) {
	  output.push(products[featured]);
	}
      }
      return output;
    }
  }
};
