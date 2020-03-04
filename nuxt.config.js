
export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: 'tinyPaste',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Article publishing platform with encryption and markdown support.' },
      { name: 'format-detection', content: 'telephone=no'}
    ],
    link: [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=2' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png?v=2'},
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png?v=2'},
      { rel: 'shortcut icon', href: '/favicon.ico?v=2'},
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css',
        integrity: 'sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq',
        crossorigin: 'anonymous'
      }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#595959' },
  /*
  ** Global CSS
  */
  css: [
    "~static/fonts.scss",
    "~static/bulmaCustom.scss"
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    "plugins/CodeMirror.client.js"
  ],

  serverMiddleware: [
    "api/index"
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
  ],
  buefy: { 
    css: false,
    materialDesignIcons: false
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
