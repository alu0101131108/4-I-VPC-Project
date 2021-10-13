'use strict';
import {IpModel} from './ipModel.js';
import {IpView} from './ipView.js';

class IpApp {
  model;
  view;
  
  constructor() {
    this.model = new IpModel();
    this.view = new IpView(); 
  }

  loadDefaultImage(filename) {
    this.model.setOriginal(filename);
  }
  
  setup() {
    this.model.updateImageData();
    let originalWidth = this.model.original.size['width'];
    let originalHeight = this.model.original.size['height'];
    this.view.resetCanvas(originalWidth, originalHeight);
    this.setupButtons();
  }
  
  draw() {
    this.model.updateInputData(mouseX, mouseY);
    this.updateView();
  }

  setupButtons() {
    // Download button.
    document.getElementById('save-btn').onclick = () => {
      if (this.model.target) 
        save(this.model.target.p5Image,'download.png');
    };

    // TODO: Open button.
    // TODO: ROI button.
    
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

  updateView() {
    this.view.updateImages(this.model.original, this.model.target);
    this.view.updateInfo(this.model.original, this.model.inputData);
  }
  
}

export {IpApp};
