<template>
  <div>
    welcome

  </div>
</template>

<script>
import hub from '../../tool/hub'
export default {
  created() {
    hub.$emit('saveNavState', '')
  }
}
</script>

<style>
</style>