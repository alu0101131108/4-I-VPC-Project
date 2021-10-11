import './ipApp.js';
import {IpImage} from './ipImage.js';
import './../../libraries/chart.min.js';
import './../../libraries/p5.min.js';

const RED = 0;
const GREEN = 1;
const BLUE = 2;
let original, target, renderer, originalChart, targetChart;

function preload() {
  original = new IpImage('./../../images/landscape.jpg');
}

function resetCanvas() {
  // Create canvas.
  renderer = createCanvas(original.getWidth() * 2, original.getHeight());
  renderer.parent(document.getElementById('canvas'));
}

function setupButtons() {
  // Download button.
  document.getElementById('download').onclick = () => {
    if (target) target.download();
  };
  
  // Upload button.
  document.getElementById('fileUpload').addEventListener('change', changeImg);

  // Show/Hide Charts button.
  document.getElementById('toggleCharts').onclick = () => {
    let chartboxes = document.getElementById('chartboxes');
    let targetChartBox = document.getElementById('target-chartbox');
    if (chartboxes.style.display === 'none' || chartboxes.style.display === '') {
      chartboxes.style.display = 'block';
      generateHistogram(0, 0);
      if (target) {
        targetChartBox.style.display = 'block';
        generateHistogram(1, 0);
      }
    } else {
      targetChartBox.style.display = 'none';
      chartboxes.style.display = 'none';
      document.getElementById('choice-reg').checked = true;
    }
  };

  // Histogram type radio buttons.
  document.getElementById('choice-reg').addEventListener('change', () => {
    generateHistogram(0, 0);
    if (target) generateHistogram(1, 0);
  });

  document.getElementById('choice-acc').addEventListener('change', () => {
    generateHistogram(0, 1);
    if (target) generateHistogram(1, 1);
  });

  // General transform to original image.
  document.getElementById('general-transform').onclick =  () => {
    target = original;
    target.greyscale();
  };
}

function setup() {
  resetCanvas();
  setupButtons();
  background(150);
}

function draw() {
  renderer.center('horizontal');
  original.show();
  if (target) target.show(width / 2);
}

// Change image through button.
function changeImg() {
  let reader;
  if (this.files && this.files[0]) {
    reader = new FileReader();
    reader.onload = (e) => {
      const newImg = new Image();
      newImg.addEventListener('load', () => {
        original = new IpImage(newImg.src);
        target = undefined;
        setTimeout(resetCanvas, 50);
      });
      newImg.src = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
  }
}

// imgOption - 0 for original; 1 for target.
// histType - 0 for regular; 1 for accumulative.
function generateHistogram(imgOption, histType) {
  let dataRed, dataGreen, dataBlue, chartID;
  if (imgOption === 0 && histType === 0) {
    dataRed = original.getIntensityFrequency(RED);
    dataGreen = original.getIntensityFrequency(GREEN);
    dataBlue = original.getIntensityFrequency(BLUE);
    chartID = 'original-chart';
  } else if (imgOption === 0 && histType === 1) {
    dataRed = original.getAccIntensityFrequency(RED);
    dataGreen = original.getAccIntensityFrequency(GREEN);
    dataBlue = original.getAccIntensityFrequency(BLUE);
    chartID = 'original-chart';
  } else if (imgOption === 1 && histType === 0) {
    dataRed = target.getIntensityFrequency(RED);
    dataGreen = target.getIntensityFrequency(GREEN);
    dataBlue = target.getIntensityFrequency(BLUE);
    chartID = 'target-chart';
  } else if (imgOption === 1 && histType === 1) {
    dataRed = target.getAccIntensityFrequency(RED);
    dataGreen = target.getAccIntensityFrequency(GREEN);
    dataBlue = target.getAccIntensityFrequency(BLUE);
    chartID = 'target-chart';
  }

  const datasets = {
    labels: Array.from(Array(256).keys()),
    datasets: [{
      label: 'Red',
      data: dataRed,
      backgroundColor: 'rgba(255, 0, 0, 1)'
    },
    {
      label: 'Green',
      data: dataGreen,
      backgroundColor: 'rgba(0, 255, 0, 1)'
    },
    {
      label: 'Blue',
      data: dataBlue,
      backgroundColor: 'rgba(0, 0, 255, 1)'
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
  }

  if (imgOption === 0) {
    if (originalChart) originalChart.destroy();
    originalChart = new Chart(document.getElementById(chartID), config);
  } else {
    if (targetChart) targetChart.destroy();
    targetChart = new Chart(document.getElementById(chartID), config);
  }
  
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
