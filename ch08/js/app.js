const Home = {
  template: '#homepage'
};

const About = {
  name: 'About',
  template: '#about',
  methods: {
    someAction() {
      /* Some code here */

      // direct user to contact page
      this.$router.push('/contact');
    }
  }
};

const AboutContact = {
  template: `<div>
    <h2>This is some contact information about me</h2>
    <p>Find me online, in person or on the phone</p>
  </div>`
};

const AboutFood = {
  name: 'AboutFood',
  template: `<div>
    <h2>Food</h2>
    <p>I really like chocolate, sweets and applies.</p>
  </div>`
};

const User = {
  template: `<h1>{{ formattedName }} is {{ this.emotion }}</h1>`,
  props: {
    name: String,
    emotion: {
      type: String,
      default: 'happy'
    }
  },
  computed: {
    formattedName() {
      return this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }
  }
};

const PageNotFound = {
  template: `<h1>404: Page Not Found</h1>`
};

const router = new VueRouter({
  //mode: 'history',
  //base: '/shop/',
  
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/about',
      alias: '/about-us',
      component: About,
      children: [
	{
	  name: 'contact',
	  path: 'contact',
	  component: AboutContact
	},
	{
	  name: 'food',
	  path: 'food',
	  component: AboutFood
	}
      ]
    },
    {
      path: '/user',
      component: User,
      props: {
	name: 'Sarah',
	emotion: 'happy'
      }
    },
    {
      path: '/:name/user/',
      component: User,
      props: true
    },
    {
      name: 'user',
      path: '/:name/user/:emotion',
      component: User,
      props: true
    },
    {
      path: '*',
      component: PageNotFound
    }
  ],

  linkActiveClass: 'active',
  linkExactActiveClass: 'current'
});

new Vue({
  el: '#app',

  router,
  mounted() {
    console.log(this.$route);
  }
});
