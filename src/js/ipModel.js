'use strict';

import { IpImage } from "./ipImage.js";

class IpModel {
  original;
  target;
  ipMouseValues;  // attrs: x, y, r, g, b, a, grey. Gets updated each frame.

  constructor() {  
  
  }

  setOriginal(filename) {
    this.original = new IpImage(filename);
  }

  updateImageData() {
    this.original.updateData();
    if (this.target) this.target.updateData();
  }
  
}

export {IpModel};
