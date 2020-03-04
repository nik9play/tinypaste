<template>
  <div class="container main" style="padding-top: 2000px">
    <!-- <div style="height:2000px">я пукнув. да.</div> -->
    <imageViewer src="https://via.placeholder.com/3000"/>
  </div>
</template>

<script>
import imageViewer from "~/components/imageViewer";

export default {
  components: {
    imageViewer
  },
  data: () => {
    return {
      hui: "pizda"
    }
  }
}
</script>

<style lang="scss">
</style>