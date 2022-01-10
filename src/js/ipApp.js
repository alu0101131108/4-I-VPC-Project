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
    this.view.startSpinner();
    setTimeout(() => {
      this.model.updateImageData();
      this.view.updateCanvas(this.model.original, this.model.result);
      this.view.updateImageInfo(this.model.original, this.model.result);
      this.view.updateHistograms(this.model.original, this.model.result);
      this.view.updateImageCards(this.model.images);
      this.updateImageButtons();
      this.view.updateRoiButton(this.model.state);
      this.view.stopSpinner();
    }, TIMEOUT_DELAY);
  }

  loadDefaultImages() {
    const DEFAULTS = ['greyscale-lena.jpg', 'landscape.jpg', 'art.jpg', 'tanque-anterior.jpg', 'tanque-posterior.jpg'];
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

    // Operations tab button.
    document.getElementById('showOperations-btn').onclick = () => {
      this.view.closeInterfaces();
    }
  }

  setupOperationButtons() {
    // ROI button.
    document.getElementById('roi-btn').onclick = () => {
      this.model.state = this.model.state !== 'roi' ? 'roi' : 'normal';

      this.view.updateRoiButton(this.model.state);
      this.view.closeInterfaces();
    };

    // Greyscale.
    document.getElementById('greyscale-btn').onclick = () => {
      this.view.startSpinner();
      this.model.result = this.transformer.greyscale(this.model.original);
      
      this.view.closeInterfaces();
      this.refreshView();
    };

    // Compare to another image.
    document.getElementById('compare-btn').onclick = () => {
      this.view.updateImagesSelector('compare-selector', this.model.images);
      this.view.toggleInterface('compare-interface');
    };
    document.getElementById('compare-apply-btn').onclick = () => {
      this.view.startSpinner();
      let selected = document.getElementById('compare-selector').value;
      if (!selected) return;
      this.model.result = this.model.imageById(selected);
      
      document.getElementById('showInfo-btn').click();
      this.view.closeInterfaces();
      this.refreshView();
    };

    // Linear transformation by sections specified by the user.
    document.getElementById('lbs-btn').onclick = () => {
      this.model.temp = [];

      this.view.toggleInterface('lbs-interface');
      this.view.updateTransformationChart('lbs-chart', this.transformer.createLUT((i) => i), undefined, undefined, undefined, true);
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

      this.view.updateTransformationChart('lbs-chart', LUT, undefined, undefined, undefined, true);
      this.view.clearInputValues([startX, startY, endX, endY]);
    };
    
    document.getElementById('lbs-reset-btn').onclick = () => {
      this.model.temp = [];

      this.view.updateTransformationChart('lbs-chart', this.transformer.createLUT((i) => i));
      this.view.clearInputValues(['lbs-startX', 'lbs-startY', 'lbs-endX', 'lbs-endY']);
    };
    
    document.getElementById('lbs-apply-btn').onclick = () => {
      this.view.startSpinner();
      let usedLUT = [];
      this.model.result = this.transformer.linearBySections(this.model.original, this.model.temp, usedLUT);
      
      this.view.clearInputValues(['lbs-startX', 'lbs-startY', 'lbs-endX', 'lbs-endY']);
      this.view.closeInterfaces();
      this.view.updateTransformationChart('transformation-chart', usedLUT);
      this.refreshView();
    };

    // Bright and contrast linear adjustment. 
    document.getElementById('adjustBrightContrast-btn').onclick = () => {
      this.view.toggleInterface('adjustBrightContrast-interface');
    };

    document.getElementById('adjustBrightContrast-apply-btn').onclick = () => {
      this.view.startSpinner();
      const brightInput = document.getElementById('adjust-bright');
      const contrastInput = document.getElementById('adjust-contrast');
      const newBright = brightInput.value ? brightInput.value : this.model.original.parameters.bright;
      const newContrast = contrastInput.value ? contrastInput.value : this.model.original.parameters.contrast;
      let usedLUT = [];
      this.model.result = this.transformer.linearBrightContrastAdjust(this.model.original, newBright, newContrast, usedLUT);
      
      this.view.closeInterfaces();
      this.view.updateTransformationChart('transformation-chart', usedLUT);
      this.view.clearInputValues(brightInput, contrastInput);
      this.refreshView();
    };

    // Ecualize histogram.
    document.getElementById('ecualize-btn').onclick = () => {
      this.view.startSpinner();
      let usedLUTs = [];
      this.model.result = this.transformer.ecualizeHistogram(this.model.original, usedLUTs);
      
      this.view.closeInterfaces();
      this.view.updateTransformationChart('transformation-chart', false, usedLUTs[0], usedLUTs[1], usedLUTs[2]);
      this.refreshView();
    };

    // Histogram Specification.
    document.getElementById('histogramEsp-btn').onclick = () => {
      this.view.updateImagesSelector('histogramEsp-selector', this.model.images);
      this.view.updateOperationInterfaceHistogram('histogramEsp-chart');
      this.view.toggleInterface('histogramEsp-interface');
    };
    document.getElementById('histogramEsp-selector').onchange = () => {
      let selected = this.model.imageById(document.getElementById('histogramEsp-selector').value);
      selected.updateData();
      this.view.updateOperationInterfaceHistogram('histogramEsp-chart', selected.histogramData.normal);
    };
    document.getElementById('histogramEsp-apply-btn').onclick = () => {
      this.view.startSpinner();
      let usedLUTs = [];
      let selectedId = document.getElementById('histogramEsp-selector').value;
      if (!selectedId) return;
      let selected = this.model.imageById(selectedId);
      selected.updateData();
      this.model.result = this.transformer.histogramSpecification(this.model.original, selected, usedLUTs);
      
      this.view.closeInterfaces();
      this.view.updateTransformationChart('transformation-chart', false, usedLUTs[0], usedLUTs[1], usedLUTs[2]);
      this.refreshView();
    };

    // Gamma correction.
    document.getElementById('gamma-btn').onclick = () => {
      this.view.toggleInterface('gamma-interface');
    };
    document.getElementById('gamma-apply-btn').onclick = () => {
      this.view.startSpinner();
      let gamma = document.getElementById('gamma-input');
      let usedLUT = [];
      this.model.result = this.transformer.gammaCorrection(this.model.original, gamma.value, usedLUT);
      
      this.view.closeInterfaces();
      this.view.updateTransformationChart('transformation-chart', usedLUT);
      this.view.clearInputValues(gamma);
      this.refreshView();
    };

    // Difference of images.
    document.getElementById('difference-btn').onclick = () => {
      const sameSizeFilter = (image) => {
        return this.model.original.size.width === image.size.width && this.model.original.size.height === image.size.height;
      };
      this.view.updateImagesSelector('difference-selector', this.model.images, sameSizeFilter);
      this.view.updateOperationInterfaceHistogram('difference-chart');
      this.view.toggleInterface('difference-interface');
    };
    document.getElementById('difference-selector').onchange = () => {
      let selected = this.model.imageById(document.getElementById('difference-selector').value);
      selected.updateData();
      let difference = this.transformer.generateDifferenceImage(this.model.original, selected);
      difference.updateData();
      this.view.updateOperationInterfaceHistogram('difference-chart', difference.histogramData.normal);
    };
    document.getElementById('difference-threshold-range').onchange = () => {
      let threshold = document.getElementById('difference-threshold-range').value;
      document.getElementById('difference-threshold-label').textContent = 'Umbral: ' + threshold;
    };
    document.getElementById('difference-genDif-btn').onclick = () => {
      this.view.startSpinner();
      let selectedId = document.getElementById('difference-selector').value;
      if (!selectedId) return;
      let selected = this.model.imageById(selectedId);
      this.model.result = this.transformer.generateDifferenceImage(this.model.original, selected);
      
      this.view.closeInterfaces();
      this.refreshView();
    };
    document.getElementById('difference-genMap-btn').onclick = () => {
      this.view.startSpinner();
      let selectedId = document.getElementById('difference-selector').value;
      if (!selectedId) return;
      let selected = this.model.imageById(selectedId);
      let threshold = document.getElementById('difference-threshold-range').value;
      this.model.result = this.transformer.generateDifferenceMap(this.model.original, selected, threshold, this.model.colorPicked);
      
      this.view.closeInterfaces();
      this.refreshView();
    };
    this.view.setColorPicker('difference-colorpicker', 'red', (color) => {
      document.getElementById('difference-colorpicker').style.background = color.rgbaString;
      this.model.colorPicked = {
        red: color.rgba[0],
        green: color.rgba[1],
        blue: color.rgba[2],
      };
    });
    
    // Vertical mirror.
    document.getElementById('mirror-vert-btn').onclick = () => {
      this.view.startSpinner();
      this.model.result = this.transformer.verticalMirror(this.model.original);
      
      this.view.closeInterfaces();
      this.refreshView();
    };

    // Horizontal mirror.
    document.getElementById('mirror-hor-btn').onclick = () => {
      this.view.startSpinner();
      this.model.result = this.transformer.horizontalMirror(this.model.original);
      
      this.view.closeInterfaces();
      this.refreshView();
    };


    document.getElementById('scale-btn').onclick = () => {
      this.view.toggleInterface('scale-interface');
    };

    document.getElementById('rotation-btn').onclick = () => {
      this.view.toggleInterface('rotation-interface');
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
    this.view.startSpinner();
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
