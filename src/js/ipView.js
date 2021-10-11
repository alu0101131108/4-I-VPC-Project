'use strict';

class IpView {
  renderer;
  originalChart;
  targetChart;

  constructor() {
    
  }

  resetCanvas(originalWidth, originalHeight) {
    this.renderer = createCanvas(originalWidth * 2, originalHeight);
    this.renderer.parent(document.getElementById('canvas'));
    background(150);
  }
  
  update(original, target) {
    this.renderer.center('horizontal');
    image(original.p5Image, 0, 0);
    if (target) image(target.p5Image, width / 2, 0);
  }
}

export {IpView};
