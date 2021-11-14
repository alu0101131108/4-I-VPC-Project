'use strict';

import { IpImage } from "./ipImage.js";

class IpModel {
  images;
  original;
  result;
  inputData;  // attrs: image, x, y, r, g, b, a, grey. Gets updated each frame.
  temp;
  state;
  
  constructor() {
    this.images = [];
    this.temp = [];
    this.state = 'normal';
  }

  loadImage(value) {
    let newImage;
    if (typeof (value) === 'string') {
      newImage = new IpImage("./../../images/" + value, value);
    } else {
      newImage = value;
    }
    for (let image of this.images) {
      if (image.id === newImage.id) return;
    }
    this.images.unshift(newImage);
  }

  setOriginalById(id) {
    for (let image of this.images) {
      if (image.id === id) this.original = image;
    }
    this.result = undefined;
  }

  updateImageData() {
    this.original.updateData();
    if (this.result) this.result.updateData();
  }

  updateInputData(inputX, inputY) {
    let selectedImage = '-';
    let selectedX = '-';
    let selectedY = '-';
    let selectedR = '-';
    let selectedG = '-';
    let selectedB = '-';
    let selectedA = '-';
    let selectedGrey = '-';

    if (inputX >= 0 && inputX < width && inputY >= 0 && inputY < height) {
      const PIXEL_VALUES = get(inputX, inputY);
      selectedR = PIXEL_VALUES[0];
      selectedG = PIXEL_VALUES[1];
      selectedB = PIXEL_VALUES[2];
      selectedA = PIXEL_VALUES[3];
      selectedGrey = round(0.299 * selectedR + 0.587 * selectedG + 0.114 * selectedB);  // NTSC
      // Mouse on original image.
      if (inputX < this.original.size.width && inputY < this.original.size.height) {
        selectedImage = 'Original';
        selectedX = inputX;
        selectedY = inputY;
      }
      // Mouse on result image.
      else if (inputX >= this.original.size.width && inputY < this.result.size.height) {
        selectedImage = 'Resultado';
        selectedX = inputX - this.original.size.width;
        selectedY = inputY;
      }
    }

    this.inputData = {
      image: selectedImage,
      x: selectedX,
      y: selectedY,
      r: selectedR,
      g: selectedG,
      b: selectedB,
      a: selectedA,
      grey: selectedGrey
    };
  }
  
  imageById(id) {
    for (let i = 0; i < this.images.length; i++) {
      if (this.images[i].id === id) {
        return this.images[i];
      }
    }
    console.log('ERROR - View imageById() did not find requested id');
  }
}

export {IpModel};
