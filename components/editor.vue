<template>
<div class="container main">
  <div class="header">
    <input class="post-title-edit" placeholder="Title" style="font-size:2rem;font-weight:bold" v-model="title" @input="updateValues()"/>
    <input class="post-author-edit" placeholder="Author" style="font-size:1.2rem" v-model="author" @input="updateValues()"/>
  </div>
  <div class="body">
    <!-- <textarea class="post-body-edit" v-model="content" placeholder="Markdown or HTML" @input="updateValues()"></textarea> -->
    <client-only>
      <codemirror @input="updateValues()" @scroll="scrollSync" v-model="content" :options="cmOptions" style="overflow: auto;border-right: 1px solid #cacaca;" ref="cmEditor"></codemirror>
    </client-only>
    <div class="body-separator">
      <svg style="width:1.1rem;" class="feather">
        <use xlink:href="/feather-sprite.svg#chevron-left"/>
      </svg>
    </div>
    <div class="post-body-preview content" v-html="compiledMarkdown" style="overflow-y:auto" ref="previewContainer"></div>
  </div>
</div>
</template>

<script>
import _ from 'lodash'

import { mdOptions, md } from 'assets/rendererOptions.js'

export default {
  props: {
    titleProp: {
      type: String,
      default: ""
    },
    contentProp: {
      type: String,
      default: ""
    },
    authorProp: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      cmOptions: {
        lineWrapping: true,
        mode: 'text/markdown',
        lineNumbers: true,
        extraKeys: {
          "Tab": function(cm){
            cm.replaceSelection("  " , "end");
          }
        },
        cursorScrollMargin: 100
      },
      content: this.contentProp,
      author: this.authorProp,
      title: this.titleProp,
      contentLazy: "",
      currentLine: {
        cmLine: 0,
        prLine: 0
      },
      removeAfter: [
        {
          value: "never",
          name: "Never"
        },
        {
          value: "one_day",
          name: "1 Day"
        },
        {
          value: "three_days",
          name: "3 Days"
        },
        {
          value: "one_week",
          name: "1 Week"
        },
        {
          value: "one_month",
          name: "1 Month"
        },
        {
          value: "six_months",
          name: "6 Months"
        },
      ]
    }
  },

  computed: {
    compiledMarkdown() {
      return md.render(this.contentLazy)
    }
  },
  methods: {
    updateValues: _.debounce(function() {
      this.contentLazy = this.content

      this.$emit("update-values", {
        title: this.title,
        content: this.content,
        author: this.author
      })
     }, 100),

    scrollSync: _.debounce(function(e) {
      let scrollInfo = e.getScrollInfo()

      let lineNumber = e.lineAtHeight(scrollInfo.top, 'local')
      let range = e.getRange({line: 0, ch: 0}, {line: lineNumber, ch: null})
      let parser = new DOMParser()
      let doc = parser.parseFromString(md.render(range), 'text/html')
      let totalLines = doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, pre, blockquote, hr, table')
      
      let elems = this.$refs.previewContainer.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, pre, blockquote, hr, table')

      if (elems.length > 0) {
        this.$refs.previewContainer.scrollTo({
          top: elems[totalLines.length - 1].offsetTop - this.$refs.previewContainer.offsetTop,
          behavior: 'smooth'
        })
      }
    }, 50)
  },
  mounted() {
    this.updateValues()
  }
}
</script>

<style lang="scss">
@import "bulma/sass/utilities/_all.sass";

.post-title-edit, .post-body-preview, .post-author-edit {
  font-family: 'Literata', serif;
  border: none;
  padding: 0;
  margin: 0;
  width: 100%;
  word-wrap: break-word;
  outline: none;
}

.post-body-preview {
  padding: 2rem;
  scroll-snap-align: start
}

.vue-codemirror {
  scroll-snap-align: start
}

.post-body-edit {
  font-family: 'Fira Code', monospace;
  border: none;
  padding: 0;
  margin: 0;
  resize: none;
  width: 100%;
  height: 100%;
  outline: none;
}

.body {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-top: .5rem;
  border-top: 1px solid rgb(202, 202, 202);
  overflow: auto;
  scroll-snap-type: x mandatory;
}

code {
  font-family: 'Fira Code', monospace;
}

.content pre {
  padding: .7rem
}

.CodeMirror {
  height: 100%!important;
  font-family: 'Fira Code', monospace!important;
  font-size: 0.8rem!important
}

.body-separator {
  display: none;
  background-color: #f1f1f1;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: $tablet) {
  .body {
    grid-template-columns: calc(100% - 1.3rem) 1.3rem 100%
  }

  .body-separator {
    display: flex;
  }

  .vue-codemirror {
    border-right: none!important
  }
}
</style>