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

  // Aplica cambios a la imagen original tambien, esto se puede arreglar modificando clase image y creando mas constructores de copia.
  greyscale() {
    this.associatedImage.loadPixels();
    let originalPixels = this.associatedImage.pixels;

    for (let i = 0; i < originalPixels.length; i = i + 4) {
      let ntscGreyValue = 0.299 * originalPixels[i] + 0.587 * originalPixels[i + 1] + 0.114 * originalPixels[i + 2];
      this.associatedImage.pixels[i] = ntscGreyValue;
      this.associatedImage.pixels[i + 1] = ntscGreyValue;
      this.associatedImage.pixels[i + 2] = ntscGreyValue;
    }

    this.associatedImage.updatePixels();
  }
  
}

export {sebaImage};
