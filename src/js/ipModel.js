'use strict';

import { IpImage } from "./ipImage.js";

class IpModel {
  original;
  target;
  inputData;  // attrs: image, x, y, r, g, b, a, grey. Gets updated each frame.

  constructor() {  
  
  }

  setOriginal(filename) {
    this.original = new IpImage(filename);
  }

  updateImageData() {
    this.original.updateData();
    if (this.target) this.target.updateData();
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

    if (inputX >= 0 && inputX < width && inputY > 0 && inputY <= height) {
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
      // Mouse on target image.
      else if (inputX >= this.original.size.width && inputY < this.target.size.height) {
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
  
}

export {IpModel};
