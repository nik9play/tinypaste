<template>
  <div class="container section error-page" style="display:flex;justify-content:center;align-items:center;height:100vh;text-align: center;">
    <div>
      <div style="font-size:5rem">{{ error.statusCode }}</div>
      <div>{{ error.message }}</div>
      <b-button rounded tag="router-link" to="/">Go Home</b-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['error']
}
</script>

<style lang="scss">
.error-page {
  font-size: 2rem
}
</style>