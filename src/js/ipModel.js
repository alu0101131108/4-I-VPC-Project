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
    inputX = constrain(inputX, 0, width);
    inputY = constrain(inputY, 0, height);
    const HALF_WIDTH = width / 2;
    const PIXEL_VALUES = get(inputX, inputY);
    this.inputData = {
      image: inputX < HALF_WIDTH ? 'original' : 'resultado',
      x: inputX < HALF_WIDTH ? inputX : inputX - HALF_WIDTH,
      y: inputY,
      r: PIXEL_VALUES[0],
      g: PIXEL_VALUES[1],
      b: PIXEL_VALUES[2],
      a: PIXEL_VALUES[3],
      grey: round((PIXEL_VALUES[0] + PIXEL_VALUES[1] + PIXEL_VALUES[2]) / 3)
    };
  }
  
}

export {IpModel};
