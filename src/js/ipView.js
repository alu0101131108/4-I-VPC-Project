'use strict';

class IpView {
  renderer;
  originalChart;
  targetChart;
  infoElements;

  constructor() {
    this.infoElements = {
      extension: document.getElementById('extension'),
      size: document.getElementById('size'),
      colorRange: document.getElementById('colorRange'),
      bright: document.getElementById('bright'),
      contrast: document.getElementById('contrast'),
      entropy: document.getElementById('entropy'),
      mouseXY: document.getElementById('mouseXY'),
      pixelValues: document.getElementById('pixelValues')
    }
  }

  resetCanvas(originalWidth, originalHeight) {
    this.renderer = createCanvas(originalWidth * 2, originalHeight);
    this.renderer.parent(document.getElementById('canvas'));
    background(150);
  }
  
  updateImages(original, target) {
    this.renderer.center('horizontal');
    image(original.p5Image, 0, 0);
    if (target) image(target.p5Image, width / 2, 0);
  }

  updateInfo(imageData, input) {
    // Info based on current original image.
    this.infoElements.extension.textContent = 
        'Extensión: ' + imageData.extension;
    this.infoElements.size.textContent = 
        'Tamaño: ' + imageData.size.width + ' x ' + imageData.size.height;
    // this.infoElements.colorRange.textContent = 
    //     'Rango de colores: [' + imageData.colorRange.low + 
    //     ', ' + imageData.colorRange.high + ']';
    // this.infoElements.bright.textContent = 
    //     'Brillo: ' + imageData.parameters.bright;
    // this.infoElements.contrast.textContent = 
    //     'Contraste: ' + imageData.parameters.contrast;
    // this.infoElements.entropy.textContent = 
    //     'Entropía: ' + imageData.parameters.entropy;

    // Info based on user input.
    this.infoElements.mouseXY.textContent = 
        'Imagen: ' + input.image + ',  X: ' + input.x + ',  Y: ' + input.y;
    this.infoElements.pixelValues.textContent = 
        'R: ' + input.r + ',  G: ' + input.g + ',  B: ' + input.b + ',  A: ' + 
        input.a + ',  Gris: ' + input.grey;

  }
}

export {IpView};
