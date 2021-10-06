'use strict';

class sebaImage {
  associatedImage;
  imagePath;
  
  constructor(path) {
    if (typeof(path) !== 'undefined') {
      this.imagePath = path;
      this.associatedImage = loadImage(path);
    } 
    else {
      console.log('no path');
    }
  }

  getWidth() {
    return this.associatedImage.width;
  }

  getHeight() {
    return this.associatedImage.height;
  }

  download() {
    save(this.associatedImage,'download.png');
  }

  show(xPos = 0, yPos = 0) {
    image(this.associatedImage, xPos, yPos);
  }

  // Color: 0 for RED
  //        1 for GREEN
  //        2 for BLUE
  getIntensityFrequency(color) {
    this.associatedImage.loadPixels();
    let intensityFrequency = new Array(256);
    intensityFrequency.fill(0);
    for (let i = color; i < this.associatedImage.pixels.length; i = i + 4) {
      intensityFrequency[this.associatedImage.pixels[i]]++;
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
  
}

export {sebaImage};
