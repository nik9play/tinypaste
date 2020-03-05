<template>
<div>
  <transition name="fade">
    <div v-if="loaded">
      <editor @update-values="updateValues" :titleProp="title" :contentProp="rawContent" :authorProp="author"></editor>
      <b-button style="filter: drop-shadow(0px 1px 1px #c5c5c5);" class="button-edit" type="is-light" @click="editPost" slot="trigger">Save changes</b-button>
      <b-button style="filter: drop-shadow(0px 1px 1px #c5c5c5);" class="button-remove" type="is-danger" @click="removePost" slot="trigger">Delete</b-button>
    </div>
  </transition>
</div>
</template>

<script>
import axios from 'axios'
import Editor from '~/components/editor'
import qs from 'qs'

export default {
  components: {
    Editor
  },

  data: () => {
    return {
      values: {},
      loaded: false
    }
  },

  asyncData ({ params, error, req }) {
    let self = this
    return axios.get(`https://${process.server ? req.headers.host : window.location.host}/api/get/${params.id}`)
      .then((res) => {
        if (res.data) {
          if (res.data.encryptionEnabled || res.data.expireAt) {
            return error({ statusCode: 403, message: "Post cannot be edited." })
          } else {
            return {
              title: res.data.title,
              author: res.data.author,
              encryptionEnabled: res.data.encryptionEnabled,
              rawContent: res.data.content,
              url: res.data.url
            }
          }
        } else {
          return error({ statusCode: 404, message: "Post not found." })
        }
      })
      .catch((e) => {
        error({ statusCode: 500, message: e.message })
      })
  },

  created() {
    if (process.browser) {
      let userId = localStorage.getItem("user_id")

      axios.get(`/api/checkuser/${userId}/${this.url}`)
        .then((res) => {
          if (res.data.valid) {
            this.loaded = true
          } else {
            this.$nuxt.error({ statusCode: 403, message: "Post cannot be edited." })
          }
        })
        .catch((e) => {
          this.$nuxt.error({ statusCode: 500, message: e.message })
        })
    }
  },

  methods: {
    updateValues(values) {
      this.values = values
    },

    removePost() {
      this.$buefy.dialog.confirm({
        message: 'Are you sure?',
        onConfirm: () => {
          const loadingComponent = this.$buefy.loading.open()

          let userId = localStorage.getItem("user_id")

          axios.delete(`/api/delete/${userId}/${this.url}`)
            .then((res) => {
              loadingComponent.close()
              if (res.error) {
                this.$buefy.toast.open({
                  message: `${res.error.details[0].message}`,
                })
              } else {
                this.$router.push({
                  path: "/"
                })
              }
            })
            .catch((e) => {
              loadingComponent.close()
              this.$nuxt.error({ statusCode: 500, message: e.message })
            })
        }
      })
    },

    editPost() {
      const loadingComponent = this.$buefy.loading.open()

      let userId = localStorage.getItem("user_id")

      const requestBody = {
        title: this.values.title,
        content: this.values.content,
        author: this.values.author,
        userId: userId,
        postUrl: this.url
      }

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }

      let self = this

      axios.put(`/api/update`, qs.stringify(requestBody), config)
        .then((res) => {
          if (res.data.error) {
            loadingComponent.close()
            if (res.data.error.type == "string.empty") {
              self.$buefy.toast.open({
                message: `${_.capitalize(res.data.error.details[0].path[0])} is required.`,
              })
            } else {
              self.$buefy.toast.open({
                message: `Something\'s not good:<br> ${res.data.error.details[0].message}`,
              })
            }
          } else {
            loadingComponent.close()
            self.$router.push({
              path: "/" + self.url
            })
          }
        })
        .catch((e) => {
          loadingComponent.close()
          this.$nuxt.error({ statusCode: 500, message: `Error contacting API. (${e}) Please try reloading the page.` })
        })
    }
  }
}
</script>

<style lang="scss">
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
  font-family: 'FiraCode', monospace
}

.button-remove {
  position: absolute;
  right: 3rem;
  bottom: 6rem;
  opacity: 0.6;
  transition: opacity 150ms ease-in-out;
}

.button-remove:hover {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s
}

.fade-enter,
.fade-leave-to {
    opacity: 0
}
</style>