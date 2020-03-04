<template>
  <div style="margin-top:2000px">
    <img ref="image" :src="srcImg" class="lazy-image" :class="{ 'lazy-image-visible': visible }">
  </div>
</template>

<script>
export default {
  props: ["src"],
  data() {
    return {
      srcImg: this.src,
      visible: false
    }
  },

  mounted() {
    this.srcImg = "//:0"

    const observer = new IntersectionObserver((entry) => {
      if (entry[0].isIntersecting) {
        this.srcImg = this.src
        this.visible = true
      }
    })

    observer.observe(this.$refs.image)
  }
}
</script>

<style lang="scss">
.lazy-image {
  display: none;
}

.lazy-image-visible {
  display: inline;
}
</style>