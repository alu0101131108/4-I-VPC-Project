'use strict';

import { IpImage } from "./ipImage.js";

class IpTransformer {

  constructor() {}

  /**
   * Returns the Look Up Table associated to an specific function.
   * Vout = transformation(Vin);
   * @param {Function} transformation 
   * @return {Array}
   */
  createLUT(transformation) {
    const LUT = (new Array(256));
    for (let input = 0; input < 256; input++) {
      LUT[input] = constrain(transformation(input), 0, 255);
    }
    return LUT;
  }

  greyscale(original) {
    let p5Result = original.p5Image.get(); 
    p5Result.loadPixels();
    for (let i = 0; i < p5Result.pixels.length; i = i + 4) {
      let ntscGreyValue = 0.299 * p5Result.pixels[i] + 0.587 * p5Result.pixels[i + 1] + 0.114 * p5Result.pixels[i + 2];
      p5Result.pixels[i] = ntscGreyValue;
      p5Result.pixels[i + 1] = ntscGreyValue;
      p5Result.pixels[i + 2] = ntscGreyValue;
    }
    p5Result.updatePixels();
    return new IpImage(p5Result, 'greyscale-' + int(random(20)).toString() + '-' + original.id);
  }

  linealBySections(points) {
    // ...
  }

}

export {IpTransformer};

// TEMPLATE FOR OPERATION FUNCTION USING LUT.
// <operation>(original) {
//   const result = new IpImage(original.p5Image.get(), '<operation>-' + int(random(20)).toString() + '-' + original.id);
//   const LUT = this.createLUT((input) => {
//     if (input < 50) return 0;
//     else return 100;
//   });
//   result.applyLUT(LUT);
//   return result;
// }