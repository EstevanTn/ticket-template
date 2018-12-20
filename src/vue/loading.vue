<template>
  <div class="tn-loading" v-bind="loading">
      <span class="fa fa-spin fa-spinner"></span>
  </div>
</template>
<script>
export default {
  data(){
      return {};
  },
  props: {
      loading: {
          required: true,
          type: Boolean,
          default: false
      }
  }
}
</script>
