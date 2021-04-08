Vue.component('breadcrumb', {
  template: '<div>' +
      '<span v-for="(f, i) in folders">' +
        '<a :href="f.path">{{ f.name || 'Home' }}</a>' +
        '<i v-if="i !== (folders.length -1)"> &raquo; </i>' +
      '</span>' +
    '</div>',

  computed: {
    folders() {
      let output = [],
	  slug = '',
	  parts = this.$store.state.path.split('/');

      for (let item of parts) {
	slug += item;
	output.push({'name': item || 'home', 'path': '#' + slug});
	slug += '/';
      }

      return output;
    }
  }
});

Vue.component('folder', {
  template: '<li><strong><a :href="\'#\' + "f.path_lower">{{ f.name }}</a></strong></li>',
  props: {
    f: Object
  }
});

Vue.component('file', {
  template: '<li><strong>{{ f.name }}</strong><span v-if="f.size"> - {{ bytesToSize(f.size) }}</span><span v-if="link"> - <a :href="link">Download</a></span></li>',
  props: {
    f: Object,
    d: Object
  },
  
  data() {
    return {
      byteSizes: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
      link: false
    }
  },
  
  methods: {
    bytesToSize(bytes) {
      // Set a default
      let output = '0 Byte';
      
      // If the bytes are bigger then 0
      if (bytes > 0) {
	// Divide by 1024 and make an int
	let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	// Round to 2 decimal places and select the appropriate unit from the array
	output = Math.round(bytes / Math.pow(1024, i), 2) + ' ' + this.byteSizes[i];
      }
      
      return output
    }
  },
  
  created() {
    this.d.filesGetTemporaryLink({path: this.f.path_lower}).then(data => {
      this.link = data.link;
    });
  },
});

Vue.component('dropbox-viewer', {
  template: '#dropbox-viewer-template',

  data() {
    return {
      accessToken: 'XXXX',
      structure: {},
      isLoading: true
    }
  },

  computed: {
    path() {
      return this.$store.state.path
    },
    slug() {
      return this.path.toLowerCase()
	.replace(/^\/|\/$/g, '')
	.replace(/ /g, '-')
	.replace(/\//g, '-')
	.replace(/[-]+/g, '-')
	.replace(/[^\w-]+/g, '');
    }
  },
  
  methods: {
    dropbox() {
      return new Dropbox({
	accessTocke: this.accessToken
      });
    },

    createFolderStructure(response) {
      const structure = {
	folders: [],
	files: []
      }

      for (let entry of response.entries) {
	// Check ".tag" prop for type
	if(entry['.tag'] == 'folder') {
	  structure.folders.push(entry);
	} else {
	  structure.files.push(entry);
	}
      }

      this.structure = structure;
      this.isLoading = false;

    },

    createStructureAndSave(response) {

      this.createFolderStructure(response);

      this.$store.commit('structure', {
	path: this.slug,
	data: response
      });
    },
    
    getFolderStructure() {
      let data = this.$store.state.structure[this.slug];
      if(data) {
	this.createFolderStructure(this.$store.state.structure[this.slug]);
      } else {
	this.dropbox().filesListFolder({
	  path: this.path,
	  include_media_info: true
	})
	.then(this.createStructureAndSave)
	.catch(error => {
	  this.isLoading = 'error';
	  console.log(error);
	});
      }
    },

    updateStructure() {
      this.isLoading = true;
      this.getFolderStructure();
    }
  },
  
  created() {
    this.getFolderStructure();
  },

  watch: {
    path() {
      this.updateStructure();
    }
  },
});

const store = new Vuex.Store({
  state: {
    path: '',
    structure: {}
  },
  mutations: {
    updateHash(state) {
      let hash = window.location.hash.substring(1);
      state.path = (hash || '');
    },
    structure(state, payload) {
      state.structure[payload.path] = payload.data;
    }
  }
});

const app = new Vue({
  el: '#app',

  store,
  created() {
    store.commit('updateHash');
  }
});

window.onhashchange = () => {
  app.$store.commit('updateHash');
}
