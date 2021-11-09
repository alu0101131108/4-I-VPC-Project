'use strict';
import {IpImage} from './ipImage.js';
import {IpModel} from './ipModel.js';
import {IpView} from './ipView.js';
import {IpTransformer} from './ipTransformer.js';

const TIMEOUT_DELAY = 100;

class IpApp {
  model;
  view;
  transformer;
  
  constructor() {
    this.model = new IpModel();
    this.view = new IpView(); 
    this.transformer = new IpTransformer();
  }
  
  setup() {
    this.setupMenuButtons();
    this.setupOperationButtons();
    this.loadDefaultImages();
    this.refreshView();
  }
  
  draw() {
    if (!this.model.original.ready || (this.model.result && !this.model.result.ready)) 
      return; // Dont draw in case original or result arent ready.
    this.model.updateInputData(int(mouseX), int(mouseY));
    this.view.updateInputInfo(this.model.inputData);
  }

  refreshView() {
    setTimeout(() => {
      this.model.updateImageData();
      this.view.updateCanvas(this.model.original, this.model.result);
      this.view.updateImageInfo(this.model.original);
      this.view.updateHistograms(this.model.original, this.model.result);
      this.view.updateImageCards(this.model.images);
      this.updateImageButtons();
      this.view.updateRoiButton(this.model.state);
    }, TIMEOUT_DELAY);
  }

  loadDefaultImages() {
    const DEFAULTS = ['art.jpg', 'landscape.jpg', 'lena.jpg', 'greyscale-lena.jpg', 'lusda.jpg', 'thebronjame.png'];
    for (let image of DEFAULTS) this.model.loadImage(image);
    this.model.setOriginalById(DEFAULTS[0]);
  }

  setupMenuButtons() {
    // Open image file button.
    document.getElementById('fileUpload-btn').onchange = () => {
      const files = document.getElementById('fileUpload-btn').files;
      if (files.length === 0) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const htmlImg = new Image();
        htmlImg.src = reader.result;
        this.model.loadImage(new IpImage(htmlImg.src, files[0].name));
        this.model.setOriginalById(files[0].name);
        this.refreshView();
      });
      reader.readAsDataURL(files[0]);
    };
    
    // ROI button.
    document.getElementById('roi-btn').onclick = () => {
      this.model.state = this.model.state !== 'roi' ? 'roi' : 'normal';
      this.view.updateRoiButton(this.model.state);
      document.getElementById('transformation-chartbox').style.display = 'none';
    }
    
    // Save button.
    document.getElementById('save-btn').onclick = () => {
      if (this.model.result) {
        this.model.loadImage(this.model.result);
        this.view.updateImageCards(this.model.images);
        this.updateImageButtons();
      }
    };

    // INFO SECTION: Histogram type radio buttons.
    document.getElementById('choice-reg').onchange = () => {
      this.view.updateHistograms(this.model.original, this.model.result);
    };
    document.getElementById('choice-acc').onchange = () => {
      this.view.updateHistograms(this.model.original, this.model.result);
    };
  }

  setupOperationButtons() {
    // Helpers
    

    // Greyscale
    document.getElementById('greyscale-btn').onclick = () => {
      this.model.result = this.transformer.greyscale(this.model.original);
      document.getElementById('transformation-chartbox').style.display = 'none';
      this.refreshView();
    };

    // Linear transformation by sections specified by the user.
    document.getElementById('lbs-btn').onclick = () => {
      this.view.toggleOperationInterface(document.getElementById('lbs-interface'));
      document.getElementById('lbs-reset-btn').onclick();
      document.getElementById('transformation-chartbox').style.display = 'none';
    };

    document.getElementById('lbs-addSection-btn').onclick = () => {
      const startX = document.getElementById('lbs-startX');
      const startY = document.getElementById('lbs-startY');
      const endX = document.getElementById('lbs-endX');
      const endY = document.getElementById('lbs-endY');
      if (!startX.value || !startY.value || !endX.value || !endY.value) return;

      const section = {
        start: {
          x: startX.value,
          y: startY.value
        },
        end: {
          x: endX.value,
          y: endY.value
        }
      }
      startX.value = '';
      startY.value = '';
      endX.value = '';
      endY.value = '';
      
      this.model.temp.push(section);
      this.transformer.forceValidSections(this.model.temp);

      const LUT = this.transformer.createLUT((input) => {
        for (let i = 0; i < this.model.temp.length; i++) {
          let start = this.model.temp[i].start;
          let end = this.model.temp[i].end;
          if (input >= start.x && input <= end.x) {
            return start.x === end.x ? start.y : (end.y - start.y) * (input - start.x) / (end.x - start.x) + start.y;
          }
        }
        return input;
      });
      this.view.updateTransformationChart('lbs-chart', LUT);
    };
    
    document.getElementById('lbs-reset-btn').onclick = () => {
      this.model.temp = [];
      this.view.updateTransformationChart('lbs-chart', this.transformer.createLUT((i) => i));
      document.getElementById('lbs-startX').value = '';
      document.getElementById('lbs-startY').value = '';
      document.getElementById('lbs-endX').value = '';
      document.getElementById('lbs-endY').value = '';
    };
    
    document.getElementById('lbs-apply-btn').onclick = () => {
      let usedLUT = [];
      this.model.result = this.transformer.linearBySections(this.model.original, this.model.temp, usedLUT);
      
      document.getElementById('transformation-chartbox').style.display = 'block';
      this.view.updateTransformationChart('transformation-chart', usedLUT);

      document.getElementById('lbs-interface').style.display = 'none';
      this.refreshView();
    };

    // Bright and contrast linear adjustment. 
    document.getElementById('adjustBrightContrast-btn').onclick = () => {
      this.view.toggleOperationInterface(document.getElementById('adjustBrightContrast-interface'));
      document.getElementById('transformation-chartbox').style.display = 'none';
    };

    document.getElementById('adjustBrightContrast-apply-btn').onclick = () => {
      const brightInput = document.getElementById('adjust-bright');
      const contrastInput = document.getElementById('adjust-contrast');
      const newBright = brightInput.value ? brightInput.value : this.model.original.parameters.bright;
      const newContrast = contrastInput.value ? contrastInput.value : this.model.original.parameters.contrast;

      let usedLUT = [];
      this.model.result = this.transformer.linearBrightContrastAdjust(this.model.original, newBright, newContrast, usedLUT);

      document.getElementById('transformation-chartbox').style.display = 'block';
      this.view.updateTransformationChart('transformation-chart', usedLUT);

      brightInput.value = '';
      contrastInput.value = '';

      this.refreshView();
    };
  }

  updateImageButtons() {
    for (let image of this.model.images) {
      let downloadButtonID = 'download-btn-' + image.id;
      let deleteButtonID = 'delete-btn-' + image.id;
      document.getElementById(downloadButtonID).onclick = () => {
        save(image.p5Image, image.id);
      }
      document.getElementById(deleteButtonID).onclick = () => {
        const imgIndex = this.model.images.indexOf(image);
        if (imgIndex > -1) {
          this.model.images.splice(imgIndex, 1);
        }
      }
      document.getElementById(image.id).onclick = () => {
        this.model.setOriginalById(image.id);
        this.refreshView();
      }
    }
  }

  mousePressedOnCanvas() {
    // Check if roi is being selected.
    if (this.model.state === 'roi') {
      this.model.temp = [];
      this.model.temp.push({x: int(mouseX), y: int(mouseY)});
    }

    // Other mousePressed in canvas handler
  }

  mouseReleasedOnCanvas() {
    // Check if roi is being selected and first click was successful.
    if (this.model.state === 'roi' && this.model.temp[0]) {
      this.model.temp.push({x: int(mouseX), y: int(mouseY)});
      this.generateROI(this.model.temp[0], this.model.temp[1]);
    }

    // Other mouseReleased in canvas handler
  }

  generateROI(first, second) {
    let roiX = min(first.x, second.x);
    let roiY = min(first.y, second.y);
    let roiWidth = max(first.x, second.x) - min(first.x, second.x);
    let roiHeight = max(first.y, second.y) - min(first.y, second.y);
    let roi = get(roiX, roiY, roiWidth, roiHeight);
    let roiname = 'ROI-' + int(random(100)).toString() + '-' + this.model.original.id;
    this.model.result = new IpImage(roi, roiname);
    this.model.temp = [];
    this.model.state = 'normal';
    this.refreshView();
  }

}

export {IpApp};
