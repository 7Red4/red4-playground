const jsk = `
{
  from {
    transform: translate( [[ 23% ]], [[ 0% ]]); width: [[ 20% ]];
  }
  48% {
    transform: translate( [[ 23% ]], [[ 120% ]]); width: [[ 43% ]];
  }
  to {
    transform: translate( [[ 23% ]], [[ 100% ]]); width: [[ 120% ]];
  }
}
`;

const targetRe = /\[\[((?:.|\r?\n)+?)\]\]/g;

const getKeyArr = (keyframeString) => {
  let keyArr = [];
  try {
    keyArr = keyframeString
      .replace(/from/, "0%")
      .replace(/to/, "100%")
      .replace(/ |\n/g, "")
      .replace(/^{/, "")
      .split("}")
      .filter((v) => !!v);
  } catch (e) {
    console.log(e);
  }
  return keyArr;
};

const cssUnits = [
  "m",
  "ex",
  "%",
  "px",
  "cm",
  "mm",
  "in",
  "pt",
  "pc",
  "ch",
  "rem",
  "vh",
  "vw",
  "vmin",
  "vmax",
];

const cssUnitsRe = /[^\d]m|[^\d]ex[^\d]|[^\d]%|[^\d]px|[^\d]cm|[^\d]mm|[^\d]in|[^\d]pt|[^\d]pc|[^\d]ch|[^\d]rem|[^\d]vh|[^\d]vw|[^\d]vmin|[^\d]vmax/g;

const getKeyObj = (keyArr) => {
  let output = {};
  keyArr.forEach((keyString) => {
    const keyFrames = keyString.split("%{").filter((v) => !!v);
    const keyTime = keyFrames[0];
    output[keyTime] = {};
    keyFrames[1]
      .split(";")
      .filter((v) => !!v)
      .forEach((row, idx) => {
        const propRow = row.split(":").filter((v) => !!v);
        let values = [];
        values = [...parseValue(propRow[1])];
        output[keyTime][`key${idx}`] = values;
      });
  });
  console.log(output);
};

const parseValue = (text) => {
  let arr,
    output = [],
    counter = 0;

  while ((arr = targetRe.exec(text)) !== null) {
    /** TODO:
     * parse responsive value
     * get before and after texts
     * parent's property
     */
    output.push({ prop: `prop${counter}`, val: arr[1] });
    counter++;
  }
  return output;
};

const parseResponse = () => {};

getKeyObj(getKeyArr(jsk));
