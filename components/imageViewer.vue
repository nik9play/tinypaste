<template>
  <img :src="src" :style="{transform: imgTransform}" @click="openImage" :class="{'image-opened': imageOpened}">
</template>

<script>
export default {
  props: ["src"],
  data() {
    return {
      imgTransform: "translate(0, 0)",
      imageOpened: false
    }
  },
  methods: {
    openImage(e) {
      this.imageOpened = true
      const widthOffset = `calc(50vw - ${e.srcElement.width / 2}px)`
      const heightOffset = `calc(50vh - ${e.srcElement.height / 2}px - ${e.srcElement.y}px)`
      console.log(e)
      this.imgTransform = `translate(${widthOffset}, ${heightOffset})`
    }
  }
}
</script>

<style lang="scss">
img {
  transition: all .2s ease-in-out;
  cursor: pointer;
  max-width: 100%;
  max-height: 50vh;
}

  .image-opened {
    max-height: 90vh;
  }
</style>