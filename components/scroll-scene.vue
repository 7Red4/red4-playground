<template>
  <div class="scene" :style="[fixStyle, overflowStyle]">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    st: Number,
    bindPoint: Number,
    duration: Number // distance of scroll top
  },
  data() {
    return {
      bindOn: 0,
      clientHeight: 0,
      elementId: Math.floor(Math.random() * 10000) // this should be change
    };
  },
  mounted() {
    this.bindOn = this.bindPoint || this.$el.offsetTop;
    this.clientHeight = this.$el.clientHeight;
    const holder = document.createElement("div");
    holder.style.height = `${this.clientHeight + this.duration}px`;
    const sib = this.$el.nextSibling;
    this.$el.parentNode.insertBefore(holder, sib);
  },
  computed: {
    isOverflow() {
      return this.st - this.bindOn >= this.duration;
    },
    percentage() {
      let output =
        this.st >= this.bindOn
          ? ((this.st - this.bindOn) / this.duration) * 100
          : 0;
      output = output >= 100 ? 100 : output;
      this.$emit("change", output);
      return output;
    },
    souldFix() {
      let should = this.st > this.bindOn && this.percentage < 100;

      return should;
    },
    overflowStyle() {
      let output = {
        position: "absolute",
        top: `${this.bindOn + this.duration}px`
      };
      return this.isOverflow ? output : {};
    },
    fixStyle() {
      let output = {
        position: "fixed",
        top: "0px"
      };
      return this.souldFix ? output : {};
    }
  }
};
</script>

<style lang="scss" scoped>
.scene {
  width: 100vw;
  height: 100vh;
}
.fix {
  position: fixed;
  top: 0;
}
</style>