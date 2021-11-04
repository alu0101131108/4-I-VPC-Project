'use strict';
import { IpImage } from './ipImage.js';
import {IpModel} from './ipModel.js';
import {IpView} from './ipView.js';

class IpApp {
  model;
  view;
  state;      // normal, roi;
  
  constructor() {
    this.model = new IpModel();
    this.view = new IpView(); 
    this.state = 0;
  }

  loadDefaultImage(filename) {
    this.model.loadImage(new IpImage("./../../images/" + filename, filename));
    this.model.setOriginalById(filename);
  }
  
  setup() {
    this.model.updateImageData();
    this.model.mouseSelection = [];
    this.state = 'normal'
    this.view.updateCanvas(this.model.original, this.model.result);
    this.view.updateImageInfo(this.model.original);
    this.view.updateHistograms(this.model.original.histogramData.normal);
    this.setupButtons();
  }
  
  draw() {
    this.model.updateInputData(int(mouseX), int(mouseY));
    this.view.updateInputInfo(this.model.inputData);
  }

  setupButtons() {
    // Current original image selector.
    this.view.updateOriginalSelector(this.model.images, this.model.original);
    document.getElementById('original-selector').onchange = (event) => {
      this.model.setOriginalById(event.target.value);
      this.setup();
    }

    // Open image file button.
    document.getElementById('fileUpload-btn').onchange = () => {
      const files = document.getElementById('fileUpload-btn').files;
      if (files.length === 0) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const htmlImg = new Image();
        htmlImg.src = reader.result;
        this.model.loadImage(new IpImage(htmlImg.src, files[0].name));
        setTimeout(() => {
          this.model.setOriginalById(files[0].name);
          this.setup();
        }, 200);
      });
      reader.readAsDataURL(files[0]);
    };
    
    // ROI button.
    this.view.updateRoiButton(this.state);
    document.getElementById('roi-btn').onclick = () => {
      this.state = this.state !== 'roi' ? 'roi' : 'normal';
      this.view.updateRoiButton(this.state);
    }
    
    // Save button.
    document.getElementById('save-btn').onclick = () => {
      if (this.model.result) {
        let saveName = this.model.result.id;
        if (document.getElementById('save-btn-text').value) {
          saveName = document.getElementById('save-btn-text').value;
          this.model.result.id = saveName;
        }
        this.model.loadImage(this.model.result);
        this.setup();
      }
    };

    // Download button.
    document.getElementById('download-btn').onclick = () => {
      if (this.model.result) {
        let downloadName = this.model.result.id;
        if (document.getElementById('download-btn-text').value)
          downloadName = document.getElementById('download-btn-text').value;
        save(this.model.result.p5Image, downloadName);
      }
    };

    // Toggle operations button.
    document.getElementById('showOperation-btn').onclick = () => {
      let operationsDiv = document.getElementById('operations');
      if (operationsDiv.style.display === 'none' || operationsDiv.style.display === '') {
        operationsDiv.style.display = 'block';
      } else {
        operationsDiv.style.display = 'none';
      }
    };

    // Toggle info button.
    document.getElementById('showInfo-btn').onclick = () => {
      let infoDiv = document.getElementById('information');
      if (infoDiv.style.display === 'none' || infoDiv.style.display === '') {
        infoDiv.style.display = 'block';
      } else {
        infoDiv.style.display = 'none';
      }
    };
  }

  mousePressedOnCanvas() {
    // Check if roi is being selected.
    if (this.state === 'roi') {
      this.model.mouseSelection = [];
      this.model.mouseSelection.push({x: int(mouseX), y: int(mouseY)});
    }

    // Other mousePressed in canvas handler
  }

  mouseReleasedOnCanvas() {
    // Check if roi is being selected and first click was successful.
    if (this.state === 'roi' && this.model.mouseSelection[0]) {
      this.model.mouseSelection.push({x: int(mouseX), y: int(mouseY)});
      this.generateROI(this.model.mouseSelection[0], this.model.mouseSelection[1]);
    }

    // Other mouseReleased in canvas handler
  }

  generateROI(first, second) {
    let roiX = min(first.x, second.x);
    let roiY = min(first.y, second.y);
    let roiWidth = max(first.x, second.x) - min(first.x, second.x);
    let roiHeight = max(first.y, second.y) - min(first.y, second.y);
    let roi = get(roiX, roiY, roiWidth, roiHeight);
    let roiname = 'ROI-' + int(random(20)).toString() + '-' + this.model.original.id;
    this.model.result = new IpImage(roi, roiname);
    this.setup();
  }

}

export {IpApp};
