'use strict';

class IpImage {
  p5Image;
  id;
  greyPixels;
  extension;
  size;           // attrs: width, height.
  histogramData;  // attrs: normal: [red, green, blue, grey], accumulated: [red, green, blue, grey].
  colorRange;     // attrs: low, high.
  parameters;     // attrs: bright, contrast, entropy.
  ready;
  currentRotation;
  backgroundColor;  // This color will not be counted in the histogram.
  
  constructor(value, filename, backgroundColor) {
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
    this.currentRotation = 0;
    this.backgroundColor = backgroundColor;
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
    let backgroundPixelsCount = 0;

    // Calculate non normalized, normal histogram data.
    this.p5Image.loadPixels();
    for (let i = 0; i < this.p5Image.pixels.length; i = i + 4) {
      let r = this.p5Image.pixels[i];
      let g = this.p5Image.pixels[i + 1];
      let b = this.p5Image.pixels[i + 2];

      // Background check.
      if (this.backgroundColor && this.backgroundColor.r === r &&
          this.backgroundColor.g === g && this.backgroundColor.b === b) {
        backgroundPixelsCount++;
        continue;
      }

      let grey = round(0.299 * r + 0.587 * g + 0.114 * b);  // NTSC
      this.greyPixels.push(grey);
      this.histogramData.normal.red[r]++;
      this.histogramData.normal.green[g]++;
      this.histogramData.normal.blue[b]++;
      this.histogramData.normal.grey[grey]++;
    }
    // Normalize data and calculate the accumulated histogram data.
    const TOTAL_PIXELS = this.size.width * this.size.height - backgroundPixelsCount;
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

  applyLUT(LUTall, LUTred, LUTgreen, LUTblue) {
    if (LUTall) {
      LUTred = LUTall;
      LUTgreen = LUTall;
      LUTblue = LUTall;
    }

    this.p5Image.loadPixels();
    for (let i = 0; i < this.p5Image.pixels.length; i = i + 4) {
      this.p5Image.pixels[i] = LUTred[this.p5Image.pixels[i]];
      this.p5Image.pixels[i + 1] = LUTgreen[this.p5Image.pixels[i + 1]];
      this.p5Image.pixels[i + 2] = LUTblue[this.p5Image.pixels[i + 2]];
      // this.p5Image.pixels[i + 3] is the alpha value, therefore remains static.
    }
    this.p5Image.updatePixels();
  }

  // ALL FOLLOWING FUNCTIONS DO NOT HANDLE loadPixels() NOR updatePixels().
  getRowPixels(index) {
    if (index >= this.size.height) {
      console.log('Error at IpImage::getRowPixels() param out of range');
      return;
    }
    
    let firstIndex = index * this.size.width * 4;
    let row = [];
    for (let i = 0; i < this.size.width * 4; i++) {
      row.push(this.p5Image.pixels[firstIndex + i]);
    }
    return row;
  }

  getColumnPixels(index) {
    if (index >= this.size.width) {
      console.log('Error at IpImage::getColumnPixels() param out of range');
      return;
    }
    let column = [];
    
    for (let i = 0; i < this.size.height; i++) {
      for (let j = 0; j < 4; j++) {
        column.push(this.p5Image.pixels[index * 4 + j]);
      }
      index = index + this.size.width;
    }
    return column;
  }

  setRowPixels(index, row) {
    if (row.length !== this.size.width * 4 || index >= this.size.height) {
      console.log('Error at IpImage::setRowPixels() invalid parameters');
      return;
    }

    let firstIndex = index * this.size.width * 4;
    for (let i = 0; i < this.size.width * 4; i++) {
      this.p5Image.pixels[firstIndex + i] = row[i];
    }
  }

  setColumnPixels(index, column) {
    if (column.length !== this.size.height * 4 || index >= this.size.width) {
      console.log('Error at IpImage::setColumnPixels() invalid parameters');
      return;
    }

    for (let i = 0; i < this.size.height; i++) {
      for (let j = 0; j < 4; j++) {
        this.p5Image.pixels[index * 4 + j] = column[i * 4 + j];
      }
      index = index + this.size.width;
    }
  }

  // Returns object with color components RGBA for the specified point. 
  getColor(point) {
    if (point.x < 0 || point.x >= this.p5Image.width ||
        point.y < 0 || point.y >= this.p5Image.height) {
      console.log(point.x, point.y);
    }

    let index = (point.y * this.p5Image.width + point.x) * 4;
    return { 
      r: this.p5Image.pixels[index],
      g: this.p5Image.pixels[index + 1],
      b: this.p5Image.pixels[index + 2],
      a: this.p5Image.pixels[index + 3],
    };
  }

  // Sets color components RGBA for the specified point. 
  setColor(point, color) {
    if (point.x < 0 || point.x >= this.p5Image.width ||
        point.y < 0 || point.y >= this.p5Image.height) {
      console.log("Error at IpImage::setColor() with indexes", point.x, point.y);
    }

    let index = (point.y * this.p5Image.width + point.x) * 4;
    this.p5Image.pixels[index] = color.r;
    this.p5Image.pixels[index + 1] = color.g;
    this.p5Image.pixels[index + 2] = color.b;
    this.p5Image.pixels[index + 3] = color.a;
  }

}
    
export {IpImage};

