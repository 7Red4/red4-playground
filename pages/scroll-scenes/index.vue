<template>
  <div>
    <p class="fix">{{ st }}</p>
    <div class="have-height" style="background-color: red"></div>
    <scene :st="st" :duration="1000" @change="(val) => {s1Percentage = val}">
      <div class="con">
        <div :style="[moveRight]">asdasdasdsad</div>
        <div :style="[moveLeft]">asdasdasdsad</div>
      </div>
    </scene>
    <div class="have-height" style="background-color: blue"></div>
  </div>
</template>

<script>
import scene from "@/components/scroll-scene.vue";

export default {
  layout: "none",
  components: {
    scene
  },
  created() {
    if (process.client) {
      window.addEventListener("scroll", this.scrollHandler);
    }
  },
  beforeMount() {
    if (process.client) {
      this.scrollHeight = document.documentElement.scrollHeight;
      this.vh = document.documentElement.clientHeight;
    }
  },
  beforeDestroy() {
    if (process.client) {
      window.removeEventListener("scroll", this.scrollHandler);
    }
  },
  data() {
    return {
      st: 0,
      scrollHeight: 0,
      vh: 0,

      s1Percentage: 0
    };
  },
  computed: {
    sb() {
      return this.st + this.vh;
    },
    sceneTotalHeight() {
      return this.scrollHeight - this.vh;
    },

    moveRight() {
      let pa = this.s1Percentage;
      let output = {
        transform: `translateX(${pa}%)`
      };
      return output;
    },
    moveLeft() {
      let pa = this.s1Percentage;
      let output = {
        transform: `translateX(${-pa}%)`
      };
      return output;
    }
  },
  methods: {
    scrollHandler() {
      this.st =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
    }
  }
};
</script>

<style lang="scss" scoped>
.fix {
  position: fixed;
}
.con {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.have-height {
  height: 3000px;
}
</style>