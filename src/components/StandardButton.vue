<template>
  <button :class="$style.dialogButton">
    <slot />
  </button>
</template>

<style lang="scss" module>
  .dialogButton {
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    color: #fff;
    background-color: #737373;
    border: 0;
  }
</style>