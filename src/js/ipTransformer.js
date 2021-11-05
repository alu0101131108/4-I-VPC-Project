'use strict';

import { IpImage } from "./ipImage.js";

class IpTransformer {

  constructor() {}

  // Not working
  greyscale(original) {
    let p5Result = new p5.Image(original.size.width, original.size.height);
    original.p5Image.loadPixels();
    p5Result.pixels = original.p5Image.pixels.slice();
    p5Result.loadPixels();

    for (let i = 0; i < p5Result.pixels.length; i = i + 4) {
      let ntscGreyValue = 0.299 * p5Result.pixels[i] + 0.587 * p5Result.pixels[i + 1] + 0.114 * p5Result.pixels[i + 2];
      p5Result.pixels[i] = ntscGreyValue;
      p5Result.pixels[i + 1] = ntscGreyValue;
      p5Result.pixels[i + 2] = ntscGreyValue;
    }

    p5Result.updatePixels();
    
    console.log(p5Result);

    return new IpImage(p5Result, 'greyscale-' + original.id);
  }

}

export {IpTransformer};