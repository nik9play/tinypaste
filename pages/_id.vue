<template>
  <div class="container">
    <!-- <transition name="fade"> -->
    <b-button class="button-edit" type="is-light" @click="editPost" slot="trigger" v-if="editBtn">Edit</b-button>
    <!-- </transition> -->
    <div class="section">
      <div class="post-title" style="font-size:2rem;font-weight:bold">{{ title }}</div>
      <div class="post-author" style="font-size:1.1rem;color:rgb(149, 149, 149)">{{ author }} &#8226; created {{ dateCreated }} <span v-if="dateCreated != dateEdited">&#8226; edited {{ dateEdited }}</span></div>
      <div class="post-body content" v-html="content"></div>
    </div>
      <div v-if="encryptionEnabled" class="passwordModal">
        <input type="password" @keyup.enter="passEnter" v-model="password" placeholder="Password"/>
      </div>
  </div> 
</template>
<script>
import axios from 'axios'
import moment from 'moment'
import cryptoAES from "crypto-js/aes"
import cryptoJS from "crypto-js"

import { mdOptions, md } from 'assets/rendererOptions.js'

export default {
  asyncData ({ params, error, req }) {
    let self = this
    return axios.get(`https://${process.server ? req.headers.host : window.location.host}/api/get/${params.id}`)
      .then((res) => {
        if (res.data) {
          return {
            title: res.data.title,
            author: res.data.author,
            content:  md.render(res.data.content),
            dateCreated: moment(res.data.createdAt).fromNow(),
            dateEdited: moment(res.data.updatedAt).fromNow(),
            encryptionEnabled: res.data.encryptionEnabled,
            rawContent: res.data.content,
            url: res.data.url,
            expireAt: res.data.expireAt
          }
        } else {
          error({ statusCode: 404, message: "Post not found." })
        }
      })
      .catch((e) => {
        error({ statusCode: 500, message: e.message })
      })
  },

  data: function() {
    return {
      id: this.$route.params.id,
      password: "",
      editBtn: false
    }
  },

  methods: {
    passEnter() {
      let bytes  = cryptoAES.decrypt(this.rawContent, this.password)

      let newContent = bytes.toString(cryptoJS.enc.Utf8)

      if (newContent) {
        this.content = md.render(newContent)
        this.encryptionEnabled = false
      } else {
        this.$buefy.toast.open('Password is wrong.')
      }
    },
    editPost() {
      this.$router.push({
        path: "/edit/" + this.url
      })
    }
  },

  mounted() {
    this.$nextTick(function () {
      if (process.browser) {
        let user_id = localStorage.getItem("user_id")

        axios.get(`/api/checkuser/${user_id}/${this.url}`)
          .then((res) => {
            if (res.data.valid && !this.encryptionEnabled && !this.expireAt) {
              this.editBtn = true
            }
          })
          .catch((e) => {
            console.error(e)
          })
      }
    })
  },

  head() {
    return {
      title: 'tinyPaste — ' + this.title,
      meta: [
        { hid: 'description', name: 'description', content: this.content.replace(/(<([^>]+)>)/ig,"").slice(0, 200) }
      ]
    }
  }
}
</script>

<style lang="scss">
html {
  overflow-y: unset;
}

.post-title, .post-body, .post-author {
  font-family: 'Literata', serif;
  padding: 0;
  margin: 0;
  width: 100%;
  word-wrap: break-word;
}

.post-body {
  padding-top: .5rem;
  margin-top: .5rem;
  border-top: 1px solid rgb(202, 202, 202);
}

code {
  font-family: 'FiraCode', monospace
}

.passwordModal {
  font-size: 1.3rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  display: flex;
  justify-content: center;
  align-items: center;
  input {
    padding: .5rem;
    border: none;
    background: transparent;
    border-bottom: 1px solid #ccc;
    font-size: 1.7rem;
  }
}

.button-edit {
  position: fixed;
  right: 3rem;
  bottom: 3rem;
  opacity: 0.6;
  transition: opacity 150ms ease-in-out;
}

.button-edit:hover {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .8s
}

.fade-enter,
.fade-leave-to {
  opacity: 0
}
</style>