<template>
  <div
    contenteditable
    class="post-body-edit"
    @input="$emit('input', $event.target.innerText)"
    v-once :value="value"
  >
  {{ value }}
  </div>
</template>

<script>
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

export default {
  props:['value'],
  watch: {
    value: function (newValue) {
      this.$el.innerHTML = hljs.highlight("markdown", newValue).value
      let tag = this.$el
      let setpos = document.createRange()
      let set = window.getSelection()
      setpos.setStart(tag.childNodes[0], this.$el.innerText.length)
      setpos.collapse(true)
      set.removeAllRanges()
      set.addRange(setpos)
      tag.focus()
    }
  }
}
</script>