<template>
  <svg :width="width" :height="height">

  </svg>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data(){
    return {
      text: "Hello There",
      width: 300,
      height: 300
    }
  },
  mounted() {
    console.log(this.text)
  }
})
</script>
<style>
svg{
  background: white;
}
</style>
