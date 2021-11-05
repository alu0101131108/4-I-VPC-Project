'use strict';

class IpImage {
  p5Image;
  id;
  greyPixels;
  extension;
  size;           // attrs: width, height.
  histogramData;  // attrs: normal: [r, g, b, grey], accumulated: [r, g, b, grey].
  colorRange;     // attrs: low, high.
  parameters;     // attrs: bright, contrast, entropy.
  ready;
  
  constructor(value, filename) {
    // Path constructor, if no filename is specified it will look at last path directory.
    if (typeof(value) === 'string') {
      this.p5Image = loadImage(value);
      filename = filename ? filename : value.split('/').pop();
      this.id = filename;
      this.extension = filename.split('.').pop();
    }
    // P5Image object constructor
    else if (typeof(value) === 'object' && filename) {
      this.p5Image = value;
      this.id = filename;
      this.extension = filename.split('.').pop();
    }
    // No construction method recognized.
    else {
      console.log('ERROR - IpImage constructor failed.');
    }

    // Attributes lists initialization.
    const emptyZeroArray = (n) => {
      let result = new Array(n);
      result.fill(0);
      return result;
    }
    this.greyPixels = emptyZeroArray(0);
    this.histogramData = {
      normal: {
        red: emptyZeroArray(256),
        green: emptyZeroArray(256),
        blue: emptyZeroArray(256),
        grey: emptyZeroArray(256)
      },
      accumulated: {
        red: emptyZeroArray(256),
        green: emptyZeroArray(256),
        blue: emptyZeroArray(256),
        grey: emptyZeroArray(256)
      }
    }

    this.ready = false;
  }

  updateData() {
    this.updateSize();
    this.updateHistogramData();
    this.updateColorRange();
    this.updateParameters();
    this.ready = true;
  }

  updateSize() {
    this.size = {
      width: this.p5Image.width,
      height: this.p5Image.height
    }
  }

  updateHistogramData() {
    // Calculate non normalized, normal histogram data.
    this.p5Image.loadPixels();
    for (let i = 0; i < this.p5Image.pixels.length; i = i + 4) {
      let r = this.p5Image.pixels[i];
      let g = this.p5Image.pixels[i + 1];
      let b = this.p5Image.pixels[i + 2];
      let grey = round(0.299 * r + 0.587 * g + 0.114 * b);  // NTSC
      this.greyPixels.push(grey);
      this.histogramData.normal.red[r]++;
      this.histogramData.normal.green[g]++;
      this.histogramData.normal.blue[b]++;
      this.histogramData.normal.grey[grey]++;
    }
    // Normalize data and calculate the accumulated histogram data.
    const TOTAL_PIXELS = this.size.width * this.size.height;
    for (let i = 0; i < 256; i++) {
      this.histogramData.normal.red[i] = 
          this.histogramData.normal.red[i] / TOTAL_PIXELS, 4;
      this.histogramData.normal.green[i] =
          this.histogramData.normal.green[i] / TOTAL_PIXELS, 4;
      this.histogramData.normal.blue[i] =
          this.histogramData.normal.blue[i] / TOTAL_PIXELS, 4;
      this.histogramData.normal.grey[i] =
          this.histogramData.normal.grey[i] / TOTAL_PIXELS, 4;

      if (i == 0) {
        this.histogramData.accumulated.red[i] = this.histogramData.normal.red[i];
        this.histogramData.accumulated.green[i] = this.histogramData.normal.green[i];
        this.histogramData.accumulated.blue[i] = this.histogramData.normal.blue[i];
        this.histogramData.accumulated.grey[i] = this.histogramData.normal.grey[i];
      }
      else {
        this.histogramData.accumulated.red[i] = 
            this.histogramData.accumulated.red[i - 1] + this.histogramData.normal.red[i];
        this.histogramData.accumulated.green[i] = 
            this.histogramData.accumulated.green[i - 1] + this.histogramData.normal.green[i];
        this.histogramData.accumulated.blue[i] = 
            this.histogramData.accumulated.blue[i - 1] + this.histogramData.normal.blue[i];
        this.histogramData.accumulated.grey[i] = 
            this.histogramData.accumulated.grey[i - 1] + this.histogramData.normal.grey[i];
      }
    }
  }

  updateColorRange() {
    let lowVal = 0, highVal = 255;
    while (this.histogramData.normal.grey[lowVal] === 0) lowVal++;
    while (this.histogramData.normal.grey[highVal] === 0) highVal--;
    this.colorRange = {
      low: lowVal,
      high: highVal
    }
  }

  updateParameters() { 
    this.parameters = {
      bright: this.calculateBright(),
      contrast: this.calculateContrast(),
      entropy: this.calculateEnthropy()
    }
  }

  // Get the bright of an image by calculating the average of the Histogram.
  calculateBright() {
    let brightValue = 0;
    for (let i = 0; i < 256; i++) {
      brightValue += this.histogramData.normal.grey[i] * i;
    }
    brightValue = Number((brightValue).toFixed(2));   // Rounding the value to 2 fraction digits.
    return brightValue;
  }
  
  // Get the bright of an image by calculating the standard deviation of the Histogram.
  calculateContrast() {
    let contrastValue = 0;
    let brightValue = this.calculateBright();
    for (let i = 0; i < 256; i++) {
      contrastValue += this.histogramData.normal.grey[i] * ((i - brightValue) ** 2);
    }
    contrastValue = Math.sqrt(contrastValue);
    contrastValue = Number((contrastValue).toFixed(2));   // Rounding the value to 2 fraction digits.
    return contrastValue;
  }

  // Enthropy is calculated as -SUM(p[i] * log(p[i])).
  calculateEnthropy() {
    let enthropyValue = 0;
    for (let i = 0; i < 256; i++) {
      if (this.histogramData.normal.grey[i] != 0)   // Filtering out histogram values of 0, as log(0) has no solution.
        enthropyValue += this.histogramData.normal.grey[i] * Math.log2(this.histogramData.normal.grey[i]);
    }
    enthropyValue = -enthropyValue;
    enthropyValue = Number((enthropyValue).toFixed(2));   // Rounding the value to 2 fraction digits.
    return enthropyValue;
  }
}
    
export {IpImage};
    
    


  // Color: 0 for RED
  //        1 for GREEN
  //        2 for BLUE
  //        -1 for GREYSCALE value (TODO).
  // getIntensityFrequency(color) {
  //   this.p5Image.loadPixels();
  //   let intensityFrequency = new Array(256);
  //   intensityFrequency.fill(0);
  //   for (let i = color; i < this.p5Image.pixels.length; i = i + 4) {
  //     intensityFrequency[this.p5Image.pixels[i]]++;
  //   }
  //   return intensityFrequency;
  // }

  // getAccIntensityFrequency(color) {
  //   let accumulativeIntensityFrequency = this.getIntensityFrequency(color);
  //   for (let i = 1; i < accumulativeIntensityFrequency.length; i++) {
  //     accumulativeIntensityFrequency[i] = accumulativeIntensityFrequency[i - 1] +
  //         accumulativeIntensityFrequency[i];
  //   }
  //   return accumulativeIntensityFrequency;
  // }

  // Esto nose si deberia ir aqui la vd.
  // greyscale() {
  //   this.p5Image.loadPixels();
  //   let originalPixels = this.p5Image.pixels;

  //   for (let i = 0; i < originalPixels.length; i = i + 4) {
  //     let ntscGreyValue = 0.299 * originalPixels[i] + 0.587 * originalPixels[i + 1] + 0.114 * originalPixels[i + 2];
  //     this.p5Image.pixels[i] = ntscGreyValue;
  //     this.p5Image.pixels[i + 1] = ntscGreyValue;
  //     this.p5Image.pixels[i + 2] = ntscGreyValue;
  //   }

  //   this.p5Image.updatePixels();
  // }

