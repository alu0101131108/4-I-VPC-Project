'use strict';

class IpView {
  renderer;
  originalChart;
  resultChart;
  transformationChart;
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
    const normal = document.getElementById('choice-reg').checked;

    // Original image chart.
    if (this.originalChart) this.originalChart.destroy();
    this.originalChart = this.generateHistogramChart(document.getElementById('original-chart'), 
      original.histogramData[normal ? 'normal' : 'accumulated']);

    // Result image chart (optional).
    document.getElementById('result-chartbox').style.display = result ? 'block' : 'none';
    if (!result) return

    if (this.resultChart) this.resultChart.destroy();
    this.resultChart = this.generateHistogramChart(document.getElementById('result-chart'), 
    result.histogramData[normal ? 'normal' : 'accumulated']);
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

  updateTransformationChart(canvas, LUT) {
    const datasets = {
      labels: Array.from(Array(256).keys()),
      datasets: [{
        label: 'Vout',
        data: LUT,
        borderColor: 'rgba(255,255,255,1)',
        backgroundColor: 'rgba(255,255,0,1)',
        borderDash: [5, 5],
      }]
    };

    const configuration = {
      type: 'line',
      data: datasets,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Vout'
            },
            max: 255,
            min: 0,
            beginAtZero: true
          },
          y: {
            title: {
              display: true,
              text: 'Vin'
            },
            max: 255,
            min: 0,
            beginAtZero: true
          }
        },
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    if (this.transformationChart) this.transformationChart.destroy();
    this.transformationChart = new Chart(canvas, configuration);
  }

  generateHistogramChart(canvas, data) {

    const datasets = {
      labels: Array.from(Array(256).keys()),
      datasets: [{
        label: 'Red',
        data: data.red,
        backgroundColor: 'rgba(255, 0, 0, 1)',
        hidden: true
      },
      {
        label: 'Green',
        data: data.green,
        backgroundColor: 'rgba(0, 255, 0, 1)',
        hidden: true
      },
      {
        label: 'Blue',
        data: data.blue,
        backgroundColor: 'rgba(0, 0, 255, 1)',
        hidden: true
      },
      {
        label: 'Grey',
        data: data.grey,
        backgroundColor: 'rgba(150, 150, 150, 1)'
      }]
    };
    
    const configuration = {
      type: 'bar',
      data: datasets,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Valor i'
            },
            min: 0,
            max: 255,
            beginAtZero: true
          },
          y: {
            title: {
              display: true,
              text: 'Probabilidad de i'
            },
            min: 0,
            suggestedMax: 0.1,
            beginAtZero: true
          }
        },
        maintainAspectRatio: false,
      }
    };

    return new Chart(canvas, configuration);
  }

  toggleOperationInterface(interfaceDiv) {
    if (interfaceDiv.style.display === 'block')
      interfaceDiv.style.display = 'none';
    else {
      let interfaces = document.getElementById('interfaces').children;
      for (let i = 0; i < interfaces.length; i++) {
        interfaces[i].style.display = 'none';
      }
      interfaceDiv.style.display = 'block';
    }
  }
}

export {IpView};
