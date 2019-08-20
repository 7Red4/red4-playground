<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <v-btn color="primary" tag="label">
            上傳你的 CSV
            <input type="file" hidden accept="csv" @input="previewCsv" />
          </v-btn>
          <v-textarea outline readonly v-model="result" height="600px"></v-textarea>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      result: ""
    };
  },
  methods: {
    previewCsv(e) {
      const vm = this;
      let data = e.target.files[0];
      var reader = new FileReader();
      // Read file into memory as UTF-8
      reader.readAsText(data);
      // Handle errors load
      reader.onload = loadHandler;
      reader.onerror = errorHandler;

      function loadHandler(event) {
        var csv = event.target.result;
        processData(csv);
      }

      function processData(csv) {
        var allTextLines = csv.replace(/\n超級/g, "超級").split(/\n/);
        var date = "";
        var results = "";
        //日期,時間,節目表,集數,節目類別,級別

        for (let i = 1; i < allTextLines.length; i++) {
          var data = allTextLines[i].split(",");
          let 日期 = data[0];
          let 時間 = data[1];
          let 節目表 = data[2];
          let 集數 = data[3];
          let 節目類別 = data[4];
          let 級別 = data[5];
          var tarr = [];
          if (date != "" && date == 日期) {
            results += `
<ul><li>${時間}</li><li class="li_program">${節目表.replace(
              /"|\n/g,
              ""
            )}</li><li>${集數}</li><li>${節目類別}</li><li>普</li></ul>`;
          } else {
            results += `
<strong>播出時間: ${日期} ()</strong>
<ul class="hometv_ul_title">
  <li>時間</li>
  <li class="schedule_program">節目</li>
  <li>集數</li>
  <li>類別</li>
  <li>級別</li>
</ul>
<ul>
<li>${時間}</li><li class="li_program">${節目表}</li><li>${集數}</li><li>${節目類別}</li><li>普</li></ul>`;
          }
          date = 日期;
        }
        vm.result = results;
      }

      function errorHandler(evt) {
        if (evt.target.error.name == "NotReadableError") {
          alert("Canno't read file !");
        }
      }
    }
  }
};
</script>