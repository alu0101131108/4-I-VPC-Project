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

  loadDefaultImage(filename) {
    this.model.loadImage(new IpImage("./../../images/" + filename, filename));
    this.model.setOriginalById(filename);
  }
  
  setup() {
    this.setupMenuButtons();
    this.setupOperationButtons();
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
    document.getElementById('greyscale-btn').onclick = () => {
      this.model.result = this.transformer.greyscale(this.model.original);
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
      this.model.mouseSelection = [];
      this.model.mouseSelection.push({x: int(mouseX), y: int(mouseY)});
    }

    // Other mousePressed in canvas handler
  }

  mouseReleasedOnCanvas() {
    // Check if roi is being selected and first click was successful.
    if (this.model.state === 'roi' && this.model.mouseSelection[0]) {
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
    this.model.mouseSelection = [];
    this.model.state = 'normal';
    this.refreshView();
  }

}

export {IpApp};
