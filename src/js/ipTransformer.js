'use strict';

import { IpImage } from "./ipImage.js";

class IpTransformer {

  constructor() {}

  /**
   * Returns the Look Up Table associated to an specific function.
   * Vout = transformation(Vin);
   * @param {Function} transformation 
   * @return {Array}
   */
  createLUT(transformation) {
    const LUT = (new Array(256));
    for (let input = 0; input < 256; input++) {
      LUT[input] = constrain(transformation(input), 0, 255);
    }
    return LUT;
  }

  greyscale(original) {
    let p5Result = original.p5Image.get(); 
    p5Result.loadPixels();
    for (let i = 0; i < p5Result.pixels.length; i = i + 4) {
      let ntscGreyValue = 0.299 * p5Result.pixels[i] + 0.587 * p5Result.pixels[i + 1] + 0.114 * p5Result.pixels[i + 2];
      p5Result.pixels[i] = ntscGreyValue;
      p5Result.pixels[i + 1] = ntscGreyValue;
      p5Result.pixels[i + 2] = ntscGreyValue;
    }
    p5Result.updatePixels();
    return new IpImage(p5Result, 'greyscale-' + int(random(100)).toString() + '-' + original.id);
  }

  /**
   * Applies to original, the lineal transformation defined by the sections.
   * Each section has a start and an end point as attributes. 
   * Each point has x and y coordinates as attributes.
   * @param {IpImage} original Original image to transform.
   * @param {Array} sections List of section objects.
   * @param {Array} usedLUT If passed, the used LUT will be stored on it.
   * @return {IpImage}
   */
  linearBySections(original, sections, usedLUT) {
    // Apply lineal transformation.
    let result = new IpImage(original.p5Image.get(), 'LinealPorTramos-' + int(random(100)).toString() + '-' + original.id);
    let LUT = this.createLUT((input) => {
      for (let i = 0; i < sections.length; i++) {
        let start = sections[i].start;
        let end = sections[i].end;
        // If the input belongs to a specified section, then calculate the corresponding output.
        if (input >= start.x && input <= end.x) {
          // If section defines a single point, this avoids a zero division.
          return start.x === end.x ? start.y : (end.y - start.y) * (input - start.x) / (end.x - start.x) + start.y;
        }
      }
      // If the input does not belong to any specified section, it will not change.
      return input;
    });
    result.applyLUT(LUT);
    usedLUT.length = 256;
    for(let i = 0; i < 256; i++)
      usedLUT[i] = LUT[i];
    return result;
  }

  /**
   * This will modify a sections list in order to make it valid.
   * @param {Array} sections List of section objects.
   */
  forceValidSections(sections) {
    // Start by sorting them by their minimum x.
    sections.sort((a, b) => {
      let aMinX = min(a.start.x, a.end.x);
      let bMinX = min(b.start.x, b.end.x);
      return aMinX === bMinX ? 0 : (aMinX > bMinX ? 1 : -1);
    });
    for (let i = 0; i < sections.length; i++) {
      let start = sections[i].start;
      let end = sections[i].end;
      // Restrict x and y coordinates to integers in range [0, 255].
      sections[i].start.x = int(constrain(start.x, 0, 255));
      sections[i].start.y = int(constrain(start.y, 0, 255));
      sections[i].end.x = int(constrain(end.x, 0, 255));
      sections[i].end.y = int(constrain(end.y, 0, 255));
      // Start.x must be less than end.x.
      start = sections[i].start;
      end = sections[i].end;
      if (start.x > end.x) {
        sections[i].start = end;
        sections[i].end = start;
      }
      // Avoid vertical sections.
      start = sections[i].start;
      end = sections[i].end;
      if (start.x === end.x) {
        sections[i].start.y = end.y;
      }
      // Avoid overlapping sections.
      if (i < sections.length - 1) {
        end = sections[i].end;
        let nextStart = sections[i + 1].start;
        if (end.x >= nextStart.x)
          sections[i].end.x = nextStart.x - 1;
      }
    }
  }

  linearBrightContrastAdjust(original, newBright, newContrast, usedLUT) {
    let result = new IpImage(original.p5Image.get(), 'AjusteBrilloContraste-' + int(random(100)).toString() + '-' + original.id);
    const A_VALUE = original.parameters.contrast !== 0 ? newContrast / original.parameters.contrast : 0;
    const B_VALUE = newBright - A_VALUE * original.parameters.bright;
    let LUT = this.createLUT((input) => {
      return round(A_VALUE * input + B_VALUE);
    });
    result.applyLUT(LUT);
    usedLUT.length = 256;
    for(let i = 0; i < 256; i++)
      usedLUT[i] = LUT[i];
    return result;
  }

  // usedLUTs will contain [LUTred, LUTgreen, LUTblue].
  ecualizeHistogram(original, usedLUTs) {
    let result = new IpImage(original.p5Image.get(), 'HistogramaEcualizado-' + int(random(100)).toString() + '-' + original.id);
    const LUTred = this.createLUT((input) => {
      return round(original.histogramData.accumulated.red[input] * 256) - 1;  // negative values are handled in createLUT.
    });
    const LUTgreen = this.createLUT((input) => {
      return round(original.histogramData.accumulated.green[input] * 256) - 1;
    });
    const LUTblue = this.createLUT((input) => {
      return round(original.histogramData.accumulated.blue[input] * 256) - 1;
    });
    result.applyLUT(undefined, LUTred, LUTgreen, LUTblue);

    usedLUTs.push(LUTred);
    usedLUTs.push(LUTgreen);
    usedLUTs.push(LUTblue);
    return result;
  }

  histogramEspecification(original, selected, usedLUTs) {
    let result = new IpImage(original.p5Image.get(), 'Histograma-De-' + selected.id + '-En-' + int(random(100)).toString() + '-' + original.id);

    const histogramSpecificationLUT = (color) => {
      let oldHistogram = original.histogramData.accumulated[color];
      let newHistogram = selected.histogramData.accumulated[color];
      let LUT = [];
      for (let value = 0; value < 256; value++) {
        let matchingValue;
        for (let selected = 0; selected < 256; selected++) {
          // console.log(value, oldHistogram[value], selected, newHistogram[selected]);
          if (newHistogram[selected] >= oldHistogram[value]) {
            matchingValue = selected;
            break;
          }
        }
        LUT.push(matchingValue);
      }
      return LUT;
    }

    const LUTred = histogramSpecificationLUT('red');
    const LUTgreen = histogramSpecificationLUT('green');
    const LUTblue = histogramSpecificationLUT('blue');
    result.applyLUT(undefined, LUTred, LUTgreen, LUTblue);

    usedLUTs.push(LUTred);
    usedLUTs.push(LUTgreen);
    usedLUTs.push(LUTblue);
    return result;
  }

  gammaCorrection(original, gamma, usedLUT) {
    let result = new IpImage(original.p5Image.get(), 'CorreccionGamma-' + int(random(100)).toString() + '-' + original.id);
    let LUT = this.createLUT((input) => {
      return round(pow(input / 255, gamma) * 255);
    });
    result.applyLUT(LUT);
    usedLUT.length = 256;
    for(let i = 0; i < 256; i++)
      usedLUT[i] = LUT[i];
    return result;
  }
}

export {IpTransformer};

// TEMPLATE FOR OPERATION FUNCTION USING LUT.
// <operation>(original, usedLUT) {
//   let result = new IpImage(original.p5Image.get(), '<operation>-' + int(random(100)).toString() + '-' + original.id);
//   const LUT = this.createLUT((input) => {
//     if (input < 50) return 0;
//     else return 100;
//   });
//   result.applyLUT(LUT);
//   usedLUT.length = 256;
//   for(let i = 0; i < 256; i++)
//     usedLUT[i] = LUT[i];
//   return result;
// }