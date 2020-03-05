<template>
  <div>
    <editor @update-values="updateValues" :titleProp="titleProp" :contentProp="contentProp" :authorProp="authorProp"></editor>
    <b-dropdown aria-role="menu" trap-focus class="button-publish" position="is-top-left">
      <b-button type="is-light" slot="trigger" style="filter: drop-shadow(0px 1px 1px #c5c5c5);">Publish...</b-button>
      <b-dropdown-item 
        aria-role="menu-item"
        :focusable="false"
        custom>
          <b-field label="Remove after">
            <b-select value="0" size="is-small" v-model="removeAfterValue">
              <option
                v-for="option in removeAfter"
                :value="option.value"
                :key="option.value">
                {{ option.name }}
              </option>
            </b-select>
          </b-field>
          <b-field label="Password for encryption">
            <b-tooltip multilined label="To decrypt post you need enabled JS in browser."
              type="is-light"
              position="is-top">
              <b-input type="password"
                value=""
                size="is-small"
                placeholder="Password"
                v-model="encryptionPassword">
              </b-input>
            </b-tooltip>
          </b-field>
          <b-button @click="publishPost" expanded type="is-light">Publish</b-button>
          <nuxt-link to="/faq">FAQ</nuxt-link> <a href="https://github.com">GitHub</a>
        </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import _ from 'lodash'
import uuid from 'uuid/v4'
import axios from 'axios'
import qs from 'qs'
import cryptoAES from "crypto-js/aes"

import Editor from '~/components/editor'

export default {
  components: {
    Editor
  },

  data() {
    return {
      values: {},
      encryptionPassword: "",
      removeAfterValue: 0,
      titleProp: "",
      contentProp: "",
      authorProp: "",
      removeAfter: [
        {
          value: 0,
          name: "Never"
        },
        {
          value: 1,
          name: "1 Day"
        },
        {
          value: 2,
          name: "3 Days"
        },
        {
          value: 3,
          name: "1 Week"
        },
        {
          value: 4,
          name: "1 Month"
        },
        {
          value: 5,
          name: "6 Months"
        },
      ]
    }
  },
  methods: {
    updateValues(values) {
      this.values = values
    },

    publishPost() {
      const loadingComponent = this.$buefy.loading.open()

      let userId = ""

      if (process.browser) {
        userId = localStorage.getItem("user_id")
      }

      let content = this.values.content

      let encryptionEnabled = false

      if (this.encryptionPassword) {
        content = cryptoAES.encrypt(content, this.encryptionPassword).toString()
        encryptionEnabled = true
      }

      const requestBody = {
        title: this.values.title,
        content: content,
        author: this.values.author,
        userId: userId,
        encryptionEnabled: encryptionEnabled,
        removeAfter: this.removeAfterValue
      }

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }

      let self = this

      axios.post("/api/create", qs.stringify(requestBody), config)
        .then((res) => {
          if (res.data.error) {
            loadingComponent.close()
            if (res.data.error.type == "string.empty") {
              self.$buefy.toast.open({
                message: `${_.capitalize(res.data.error.details[0].message)}`,
              })
            } else {
              self.$buefy.toast.open({
                message: `Something\'s not good:<br> ${res.data.error.details[0].message}`,
              })
            }
          } else {
            loadingComponent.close()
            self.$router.push({
              path: "/" + res.data.generatedURL
            })
          }
        })
        .catch((e) => {
          loadingComponent.close()
          this.$nuxt.error({ statusCode: 500, message: `Error contacting API. (${e}) Please try reloading the page.` })
        })
    }
  },
  created() {
    if (process.browser) {
      let user_id = localStorage.getItem("user_id")
      let uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      if (!user_id || !uuid_regex.test(user_id)) {
        localStorage.setItem("user_id", uuid())
      }

      const savedProgress = JSON.parse(localStorage.getItem("savedProgress"))
      if (savedProgress) {
        this.titleProp = savedProgress.title
        this.contentProp = savedProgress.content
        this.authorProp = savedProgress.author
      }
    }
  },

  watch: {
    values: _.throttle(function(e) {
      if (process.browser) {
        localStorage.setItem("savedProgress", JSON.stringify(this.values))
      }
    }, 300)
  }
}
</script>

<style lang="scss">
@import "bulma/sass/utilities/_all.sass";

html {
  overflow-y: hidden;
}

.main {
  display: grid;
  flex-direction: column;
  height: 100vh;
  grid-template-rows: min-content auto;
  padding: 3rem 1rem;
}

code {
  font-family: 'FiraCode', monospace;
}

.content pre {
  padding: .7rem
}

.button-publish {
  position: absolute;
  right: 3rem;
  bottom: 3rem;
  opacity: 0.6;
  transition: opacity 150ms ease-in-out;
}

@media screen and (max-width: $tablet) {
  .button-publish {
    opacity: 1;
  }
}
.button-publish:hover {
  opacity: 1;
}
</style>