<template>
  <div class="scene">
    <div class="holder" :style="{'height': `${this.clientHeight + this.duration}px`}"></div>
    <div class="content" :style="[fixStyle, overflowStyle]">
      <slot></slot>
    </div>
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
      clientHeight: 0
    };
  },
  mounted() {
    this.bindOn = this.bindPoint || this.$el.offsetTop;
    setTimeout(() => {
      this.clientHeight = window.innerHeight;
      window.addEventListener("resize", this.updateClientHeight);
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateClientHeight);
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
        top: "auto",
        bottom: 0
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
  },
  methods: {
    updateClientHeight() {
      this.clientHeight = window.innerHeight;
    }
  }
};
</script>

<style lang="scss" scoped>
.scene {
  position: relative;
  width: 100vw;
}
.content {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100vh;
}
.fix {
  position: fixed;
  top: 0;
}
</style>