import React, { useState } from 'react';
import chroma from 'chroma-js';
import './ColourMatcher.css';

/*********************/

function createLStarScale(steps){
  const RANGE_SIZE = 100; // lstar is a percentage
  const stepSize =  RANGE_SIZE / (steps + 1);
  const lstarScale = [];
  let sum = 0;
  for (let i = 0; i < steps; i++){
    sum += stepSize;
    lstarScale[i] = sum;
  }
  return lstarScale;
}

function createGreyScale(lstarScale){
  return lstarScale.map(lstar => chroma.lab(lstar, 0, 0).hex());
}

function getLuminanceColourScale(base, lstarScale){
  let lumScale = lstarScale.map(lstar => chroma.lab(lstar, 0, 0).luminance());

  let baseCol = chroma(base);
  return lumScale.map(lum => baseCol.luminance(lum).hex());
}

function getLchColourScale(base, lstarScale){
  let getValidRGB = (lstar, maxChroma, hue) => {
    let color = chroma.lch(lstar, maxChroma, hue);
    if (!color.clipped()){
      return color;
    }

    // Assumption: For a given lightness and hue, at some point on the chroma axis 
    // the colour becomes invalid in RGB. We look for that point.
    // We use integers to avoid going too deep with the divisions.
    let min = 0;
    let max = Math.floor(maxChroma);
    let chr;
    while (min < max){
      chr = Math.floor((min + max + 1) / 2); // use integers to avoid going too deep with the divisions
      color = chroma.lch(lstar, chr, hue);
      if (color.clipped()){
        max = chr - 1; // exclude chr from the range, the colour is not valid
      } else {
        min = chr;
      }
    }
    return chroma.lch(lstar, min, hue);
  }

  let [, chr, hue] = chroma(base).lch();

  let scale = lstarScale.map(lstar => getValidRGB(lstar, chr, hue).hex());
  return scale;
}

function createColourScale(base, lstarScale, method){
  switch(method){
    case 'lch':
      return getLchColourScale(base, lstarScale);
    
    case 'luminance':
      return getLuminanceColourScale(base, lstarScale);
    
    default:
      return getLuminanceColourScale(base, lstarScale);
  }
}

function getHueName(hue){
  return chroma.hsl(hue, 1, .5).name();
}

/*********************/

function ColourSwatch({colour, isBase, label}){
  let classes = 'swatch';
  classes = isBase ? [classes, 'base'].join(' ') :  classes;
  return (
    <div className={classes} style={ {backgroundColor: colour} }></div>
  );
}

function ColourScale({colours, direction}){
  const result = colours.map(colour => (
        <td key={colour}><ColourSwatch colour={colour} /></td>
      ));
  return result;
}

function BaseColourScale({base, scale, direction, label}){
  return (
    <tr className={`BaseColourScale ${direction}`} role="row">
      <th scope="row" aria-label={label}><ColourSwatch colour={base} isBase="true" /></th>
      <ColourScale colours={scale} direction={direction} />
    </tr>
  );
}

function HeaderRow({headers}){
  return (
    <tr className="sr-only">
      {headers.map(header => (<th scope="col" key={header}>{header}</th>))}
    </tr>
  );
}

function GreyScaleRow({base, greyscale}){
  return (
    <tr>
      <th scope="row" aria-label="greyscale"><ColourSwatch colour={base} isBase="true" /></th>
      {greyscale.map((shade, id) => (
        <th scope="col" key={id}><ColourSwatch colour={shade} /></th>
      ))}
    </tr>
  );
}

function GreyScaleSelection({steps, setSteps}){
  return (
    <fieldset>
      <legend>Greyscale Options</legend>
      <label>
        Number of Steps:
        <input type="number" min="1" max="20" value={steps} onChange={(event) => setSteps(Number(event.target.value))} />
      </label>
    </fieldset>
  );
}

function ColourMatcher({title, headingLevel}){
  const [steps, setSteps] = useState(3);

  let black = 'black';
  const lstarScale = createLStarScale(steps);
  let greyscale = createGreyScale(lstarScale);

  const hue = Math.floor(Math.random() * 360);
  const hueLabel = getHueName(hue);
  const base = chroma.hsl(hue, 1, .5);
  const base2 = chroma.hsl((hue + 180) % 360, 1, .5);
  let scale = createColourScale(base, lstarScale);
  let scale2 = createColourScale(base2, lstarScale);
  let scaleDirection = 'horizontal';
  let otherDirection = 'vertical';

  const Heading = headingLevel <= 6 ? `h${headingLevel}` : 'p';
  const headers = ['Base', ...lstarScale.map(item => `${Math.round(item)}%`)];

  return (
    <div className="ColourMatcher">
      <table className={otherDirection} role="table" aria-labelledby="colourmatcher">
        <caption id="colourmatcher"><Heading>{title}</Heading></caption>
        <thead>
          <HeaderRow headers={headers}/>
          <GreyScaleRow base={black} greyscale={greyscale} />
        </thead>
        <tbody>
        <BaseColourScale base={base} scale={scale} direction={scaleDirection} label={hueLabel} />      
        <BaseColourScale base={base2} scale={scale2} direction={scaleDirection} label={hueLabel} />      
        </tbody>
      </table>
      <form className="ColourMatcherForm">
        <GreyScaleSelection steps={steps} setSteps={setSteps} />
      </form>
    </div>
  );
}

export default ColourMatcher;
