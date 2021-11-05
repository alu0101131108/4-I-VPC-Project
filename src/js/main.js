import './ipApp.js';
import './../../libraries/chart.min.js';
import './../../libraries/p5.min.js';
import { IpApp } from './ipApp.js';

const APP = new IpApp();

function preload() {
  APP.loadDefaultImage('landscape.jpg');
}

function setup() {
  APP.setup();
}

function draw() {
  APP.draw();
}

function mousePressed() {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height)
    APP.mousePressedOnCanvas();
}

function mouseReleased() {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height)
    APP.mouseReleasedOnCanvas();
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.mouseReleased = mouseReleased;
