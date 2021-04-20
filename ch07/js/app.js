/**
 * Displays the folder tree breadcrumb
 * @example <breadcrumb></breadcrumb>
 */
Vue.component('breadcrumb', {
  template: '<div>' +
      '<span v-for="(f, i) in folders">' +
        '<a :href="f.path">{{ f.name || 'Home' }}</a>' +
        '<i v-if="i !== (folders.length -1)"> &raquo; </i>' +
      '</span>' +
    '</div>',
  computed: {
    folders() {
      return this.$store.state.breadcrumb;
    }
  }
});

/**
 * Displays a folder with a link and cache its contents
 * @example <folder :f="entry" :cache="getFolderStructure"></folder>
 *
 * @param {object} f The folder entry from the tree
 * @param {function} cache The getFolderStructure method from the dropbox-viewer component
 */
Vue.component('folder', {
  template: '<li><strong><a :href="\'#\' + "f.path_lower">{{ f.name }}</a></strong></li>',
  props: {
    f: Object,
    cache: Function
  },
  created() {
    this.cache(this.f.path_lower);
  }
});

/**
 * File component display size of file and download link
 * @example <file :d="dropbox()" :f="entry"></file>
 *
 * @param {object} f The file entry from the tree
 * @param {object} d The dropbox instance from the parent component
 */
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
    /**
     * Convert an integer to a human readable file size
     * @param {integer} bytes
     * @return {string}
     */
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
    // If the download link has be retrieved from the API, use it
    // if not, aquery the API
    if(this.f.download_link) {
      this.link = this.f.download_link;
    } else {
      this.d.filesGetTemporaryLink({path: this.f.path_lower})
	.then(data => {
	  this.f.download_link = this.link = data.link;
	});
    }
  },
});

/**
 * The dropbox component
 * @example <dropbox-viewer></drobox-viewer>
 */
Vue.component('dropbox-viewer', {
  template: '#dropbox-viewer-template',

  data() {
    return {
      // Dropbox API token
      accessToken: 'XXXX',

      // Current folder structure
      structure: {},
      isLoading: true
    }
  },

  computed: {
    // The current folder path
    path() {
      return this.$store.state.path
    }
  },
  
  methods: {

    /**
     * Dropbox API instance
     * @return {object}
     */
    dropbox() {
      return new Dropbox({
	accessTocke: this.accessToken
      });
    },

    /**
     * @param {string} path The path to a folder
     * @return {string} A cache-friendly URL without punctuation/symbals
     */
    generateSlug(path) {
     return path.toLowerCase()
	.replace(/^\/|\/$/g, '')
	.replace(/ /g, '-')
	.replace(/\//g, '-')
	.replace(/[-]+/g, '-')
	.replace(/[^\w-]+/g, '');
    },

    /**
     * Retrieve the folder structure form the cache or Dropbox API
     * @param {string} path The folder path
     * @return {Promise} A promise containing the folder data
     */
    getFolderStructure(path) {
      let output;

      const slug = this.generateSlug(path),
	    data = this.$store.state.structure[slug];

      if(data) {
	output = Promise.resolve(data);
      } else {
	output = this.dropbox().filesListFolder({
	  path: path,
	  include_media_info: true
	})
	.then(response => {
	  let entries = response.entries;

	  this.$store.commit('structure', {
	    path: slug,
	    data: entries
	  });

	  return entries;
	})
	.catch(error => {
	  this.isLoading = 'error';
	  console.log(error);
	});
	
      }
      return output;
    },
    
    /**
     * Display the contents of getFolderStructure
     * Updates the output to display the folders and folders
     */
    displayFolderStructure() {
      // Set the app to loading
      this.isLoading = true;

      // Create an empty object
      const structure = {
	folders: [],
	files: []
      }
      
      // Get the structure
      this.getFolderStructure(this.path).then(data => {

	for (let entry of data) {
	  // Check ".tag" prop for type
	  if(entry['.tag'] == 'folder') {
	    structure.folders.push(entry);
	  } else {
	    structure.files.push(entry);
	  }
	}

	// Update the data object
	this.structure = structure;
	this.isLoading = false;
      });
    },

    /**
     * Loop through the breadcrumb and cache parent folders
     */
    cacheParentFolders() {
      let parents = this.$store.state.breadcrumb;
      parents.reverse().shift();

      for(let parent of parents) {
	this.getFolderStructure(parent.path);
      }
    }
  },
  
  created() {
    // Display the current path & cache parent folders
    this.displayFolderStructure();
    this.cacheParentFolders();
  },

  watch: {
    // Update the view when the path gets updated
    path() {
      this.displayFolderStructure();
    }
  }
});

/**
 * the Vuex Store
 */
const store = new Vuex.Store({
  state: {
    // Current folder path
    path: '',

    // The current breadcrumb
    breadcrumb: [],

    // The cached folder contents
    structure: {},
  },
  mutations: {
    /**
     * Update the path & breadcrumb components
     * @param {object} state The state object of the store
     */
    updateHash(state, val) {
      
      let path = (window.location.hash.substring(1) || ''),
	  breadcrumb = [],
	  slug = '',
	  parts = path.split('/');

      for (let item of parts) {
	slug += item;
	breadcrumb.push({'name': item || 'home', 'path': slug});
	slug += '/';
      }

      state.path = path;
      state.breadcrumb = breadcrumb;
    },

    /**
     * Cache a folder structure
     * @param {object} state The state object of the store
     * @param {object} payload An object containing the slug and data to store
     */
    structure(state, payload) {
      state.structure[payload.path] = payload.data;
    }
  }
});

/**
 * The Vue app
 */
const app = new Vue({
  el: '#app',

  // Initialize the store
  store,

  // Update the current path on page load
  mounted() {
    store.commit('updateHash');
  }
});

/**
 * Update the path & store when the URL hash changes
 */
window.onhashchange = () => {
  app.$store.commit('updateHash');
}
