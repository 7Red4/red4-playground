<template>
  <div>
    <p class="scroll-top">scroll top: {{ st }}</p>
    <div class="have-height" style="background-color: #faa"></div>
    <scene :st="st" :duration="duration" @change="(val) => {s1Percentage = val}">
      <div class="con">
        <div :style="[moveRight]">asdasdasdsad</div>
        <div :style="[moveLeft]">asdasdasdsad</div>
      </div>
    </scene>
    <div class="have-height" style="background-color: #aaf"></div>
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
      duration: 1500,

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
      let keyFrame = ``;
      this.createKeyFrames(keyFrame);
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
    },
    createKeyFrames(jsk) {
      //
    }
  }
};
</script>

<style lang="scss" scoped>
.scroll-top {
  position: fixed;
  font-weight: 900;
  font-size: 48px;
  padding: 32px;
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