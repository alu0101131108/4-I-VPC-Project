'use strict';

class IpView {
  renderer;
  originalChart;
  resultChart;
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

  // Recreates canvas according to new original and result images.
  updateCanvas(original, result) {
    // Canvas creation
    const CANVAS_WIDTH = result ? 
        original.size.width + result.size.width : original.size.width;
    const CANVAS_HEIGHT = result ? 
        max(original.size.height, result.size.height) : original.size.height;
    this.renderer = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.renderer.parent(document.getElementById('canvas'));
    this.renderer.center('horizontal');

    // Canvas images
    background(150);
    image(original.p5Image, 0, 0);
    if (result) {
      image(result.p5Image, original.size.width, 0);
      document.getElementById('result-title').style.display = 'inline';
    } else {
      document.getElementById('result-title').style.display = 'none';
    }
  }

  // Updates info section based on current original image.
  updateImageInfo(imageData) {
    this.infoElements.extension.textContent = 
        'Extensión: ' + imageData.extension;
    this.infoElements.size.textContent = 
        'Tamaño: ' + imageData.size.width + ' x ' + imageData.size.height;
    this.infoElements.colorRange.textContent = 
        'Rango de colores: [' + imageData.colorRange.low + 
        ', ' + imageData.colorRange.high + ']';
    this.infoElements.bright.textContent = 
        'Brillo: ' + imageData.parameters.bright;
    this.infoElements.contrast.textContent = 
        'Contraste: ' + imageData.parameters.contrast;
    this.infoElements.entropy.textContent = 
        'Entropía: ' + imageData.parameters.entropy;
  }

  // Updates info section based on user input.
  updateInputInfo(inputData) {
    this.infoElements.mouseXY.textContent = 
    'Imagen: ' + inputData.image + ',  X: ' + inputData.x + ',  Y: ' + inputData.y;
    this.infoElements.pixelValues.textContent = 
    'R: ' + inputData.r + ',  G: ' + inputData.g + ',  B: ' + inputData.b + ',  A: ' + 
    inputData.a + ',  Gris: ' + inputData.grey;
  }
  
  // Updates histograms according to new original and result images. (TO CHANGE)
  updateHistograms(data) {
    const datasets = {
      labels: Array.from(Array(256).keys()),
      datasets: [{
        label: 'Red',
        data: data.red,
        backgroundColor: 'rgba(255, 0, 0, 1)'
      },
      {
        label: 'Green',
        data: data.green,
        backgroundColor: 'rgba(0, 255, 0, 1)'
      },
      {
        label: 'Blue',
        data: data.blue,
        backgroundColor: 'rgba(0, 0, 255, 1)'
      },
      {
        label: 'Grey',
        data: data.grey,
        backgroundColor: 'rgba(50, 50, 50, 1)'
      }]
    };
    
    const config = {
      type: 'bar',
      data: datasets,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        maintainAspectRatio: false,
      }
    };
    
    if (this.originalChart) this.originalChart.destroy();
    this.originalChart = new Chart(document.getElementById('original-chart'), config);
  }
  
  // Updates options in the original current image selector.
  updateOriginalSelector(images, current) {
    const originalSelector = document.getElementById('original-selector');
    while (originalSelector.firstChild) originalSelector.removeChild(originalSelector.firstChild);
    for (let image of images) {
      const option = document.createElement('option');
      option.value = image.id;
      option.text = image.id;
      originalSelector.appendChild(option);
      if (current.id === option.value) originalSelector.value = option.value;
    }
  }

  updateRoiButton(state) {
    document.getElementById('roi-btn').style.color = state === 'roi' ? 'red' : '';
  }
}

export {IpView};
