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
  
  // Updates histograms according to new original and result images.
  updateHistograms(original, result) {
    // Original image chart.
    let originalData = document.getElementById('choice-reg').checked ? 
        original.histogramData.normal : original.histogramData.accumulated;

    const originalDatasets = {
      labels: Array.from(Array(256).keys()),
      datasets: [{
        label: 'Red',
        data: originalData.red,
        backgroundColor: 'rgba(255, 0, 0, 1)'
      },
      {
        label: 'Green',
        data: originalData.green,
        backgroundColor: 'rgba(0, 255, 0, 1)'
      },
      {
        label: 'Blue',
        data: originalData.blue,
        backgroundColor: 'rgba(0, 0, 255, 1)'
      },
      {
        label: 'Grey',
        data: originalData.grey,
        backgroundColor: 'rgba(50, 50, 50, 1)'
      }]
    };
    
    const originalConfig = {
      type: 'bar',
      data: originalDatasets,
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
    this.originalChart = new Chart(document.getElementById('original-chart'), originalConfig);

    // Result image chart (optional).
    document.getElementById('result-chartbox').style.display = result ? 'block' : 'none';
    if(!result) return;

    let resultData = document.getElementById('choice-reg').checked ? 
        result.histogramData.normal : result.histogramData.accumulated;
    const resultDatasets = {
      labels: Array.from(Array(256).keys()),
      datasets: [{
        label: 'Red',
        data: resultData.red,
        backgroundColor: 'rgba(255, 0, 0, 1)'
      },
      {
        label: 'Green',
        data: resultData.green,
        backgroundColor: 'rgba(0, 255, 0, 1)'
      },
      {
        label: 'Blue',
        data: resultData.blue,
        backgroundColor: 'rgba(0, 0, 255, 1)'
      },
      {
        label: 'Grey',
        data: resultData.grey,
        backgroundColor: 'rgba(50, 50, 50, 1)'
      }]
    };
    
    const resultConfig = {
      type: 'bar',
      data: resultDatasets,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        maintainAspectRatio: false,
      }
    };
    
    if (this.resultChart) this.resultChart.destroy();
    this.resultChart = new Chart(document.getElementById('result-chart'), resultConfig);
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
