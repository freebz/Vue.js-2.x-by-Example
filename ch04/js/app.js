/**
 * API Access Token
 */
let accessToken = 'XXXX';


/**
 * Dropbox Client
 * @type {Dropbox}
 */
const dbx = new Dropbox({
  accessToken: accessToken
});

dbx.filesListFolder({path: ''})
  .then(response => {
    console.log(response.entries);
  })
  .catch(error => {
    console.log(error);
  });



Vue.component('dropbox-viewer', {
  template: '#dropbox-viewer-template',
  data() {
    return {
      accessToken: 'XXXX',
      structure: [],
      byteSizes: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
      isLoading: true
    }
  },
  methods: {
    dropbox() {
      return new Dropbox({
	accessTocke: this.accessToken
      });
    },
    getFolderStructure(path) {
      this.dropbox().filesListFolder({
	path: path,
	include_media_info: true
      })
	.then(response => {
	  console.log(response.entries);
	  this.structure = response.entries;
	  this.isLoading = false;
	})
	.catch(error => {
	  console.log(error);
	});
    },
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
    this.getFolderStructure('/images');
  }
});

new Vue({
  el: '#app'
});
