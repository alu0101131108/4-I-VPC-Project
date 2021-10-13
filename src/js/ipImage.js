'use strict';

class IpImage {
  p5Image;
  extension;
  size;           // attrs: width, height.
  histogramData;  // attrs: normal, accumulated.
  colorRange;     // attrs: low, high.
  parameters;     // attrs: bright, contrast, entropy.
  
  constructor(filename) {
    if (filename) {
      this.p5Image = loadImage('./../../images/' + filename);
      this.extension = filename.split('.').pop();
    }
  }

  updateData() {
    this.size = {
      width: this.p5Image.width,
      height: this.p5Image.height
    }
    /* TODO
    this.histogramData = {
      normal: this.getIntensityFrequency(-1),
      accumulated: this.getAccIntensityFrequency(-1)
    }
    updateColorRange();
    updateParameters();
    */
  }

  // Color: 0 for RED
  //        1 for GREEN
  //        2 for BLUE
  //        -1 for GREYSCALE value (TODO).
  getIntensityFrequency(color) {
    this.p5Image.loadPixels();
    let intensityFrequency = new Array(256);
    intensityFrequency.fill(0);
    for (let i = color; i < this.p5Image.pixels.length; i = i + 4) {
      intensityFrequency[this.p5Image.pixels[i]]++;
    }
    return intensityFrequency;
  }

  getAccIntensityFrequency(color) {
    let accumulativeIntensityFrequency = this.getIntensityFrequency(color);
    for (let i = 1; i < accumulativeIntensityFrequency.length; i++) {
      accumulativeIntensityFrequency[i] = accumulativeIntensityFrequency[i - 1] +
          accumulativeIntensityFrequency[i];
    }
    return accumulativeIntensityFrequency;
  }

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
  
}

export {IpImage};
