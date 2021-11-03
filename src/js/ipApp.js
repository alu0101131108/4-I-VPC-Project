'use strict';
import { IpImage } from './ipImage.js';
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
    this.model.loadImage(new IpImage("./../../images/" + filename, filename));
    this.model.setOriginalById(filename);
  }
  
  setup() {
    this.model.updateImageData();
    this.view.updateCanvas(this.model.original, this.model.result);
    this.view.updateImageInfo(this.model.original);
    this.view.updateHistograms(this.model.original.histogramData.normal);
    this.setupButtons();
  }
  
  draw() {
    this.model.updateInputData(mouseX, mouseY);
    this.view.updateInputInfo(this.model.inputData);
  }

  setupButtons() {
    // Current original image selector.
    this.view.updateOriginalSelector(this.model.images, this.model.original);
    document.getElementById('original-selector').onchange = (event) => {
      this.model.setOriginalById(event.target.value);
      this.setup();
    }

    // Download button.
    document.getElementById('download-btn').onclick = () => {
      if (this.model.result) 
        save(this.model.result.p5Image,'download.png');
    };

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
          setup();
        }, 200);
      });
      reader.readAsDataURL(files[0]);
    };

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
}

export {IpApp};
