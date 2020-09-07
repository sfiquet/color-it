import React, { useState, Fragment } from 'react';
import chroma from 'chroma-js';
import './ColourMatcher.css';

/*********************/

function getRandomSaturedColour(){
  const hue = Math.floor(Math.random() * 360);
  return chroma.hsl(hue, 1, .5).hex();
}

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
      <div className="fieldsetrow">
        <label>
          Number of Steps:
          <input type="number" min="1" max="20" value={steps} onChange={(event) => setSteps(Number(event.target.value))} />
        </label>
      </div>
    </fieldset>
  );
}

function HexInput({colour, setColour}){

  function validate(hexstr){
    const re = new RegExp(hexPattern);
    return re.test(hexstr);
  }

  function handleChange(event){
    const value = event.target.value;
    setHexInput(value);
    if (validate(value)){
      setColour(chroma(value).hex());
    }
  }

  const [hexInput, setHexInput] = useState(colour);
  const [hasFocus, setHasFocus] = useState(false);

  const hexPattern = "^#?(?:[A-Fa-f0-9]{3}){1,2}$";


  let value;
  let isValid;
  
  if (hasFocus){
    // while the component has focus, it uses its own state
    isValid = validate(hexInput);
    value = hexInput;

  } else {
    // when the component doesn't have focus, its state must match the props
    isValid = true;
    value = colour;
    if (hexInput !== colour) setHexInput(colour);
  }

  return (
    <input className={ isValid ? '' : 'error' } type="text" pattern={hexPattern} value={value} 
      onChange={ handleChange }
      onBlur={ event => setHasFocus(false) }
      onFocus={ event => setHasFocus(true) }
    />
  );
}

function HslPicker({hslColour, setHslColour}){
  return(
    <Fragment>
      <label>
        H:
        <input type="number" min="0" max="360" value={hslColour.h} onChange={event => setHslColour({...hslColour, h: event.target.value})} />
      </label>
      <label>
        S:
        <input type="number" min="0" max="100" value={hslColour.s} onChange={event => setHslColour({...hslColour, s: event.target.value})} />
      </label>
      <label>
        L:
        <input type="number" min="0" max="100" value={hslColour.l} onChange={event => setHslColour({...hslColour, l: event.target.value})} />
      </label>
    </Fragment>
  );
}

function ColourSelection({colour, setColour}){
  const chrCol = chroma(colour);
  const [r, g, b] = chrCol.rgb();
  let [h, s, l] = chrCol.hsl();
  let hslObj = {
    h: isNaN(h) ? 0 : Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };

  function setHslColour({h, s, l}){
    const col = chroma.hsl(h, s / 100, l /  100);
    setColour(col.hex());
  }

  return (
    <fieldset>
      <legend>New Color</legend>
      <div className="fieldsetrow">
        <label>
          HEX:
          <HexInput colour={colour} setColour={setColour} />
        </label>
      </div>
      <div className="fieldsetrow">
        <label>
          R:
          <input type="number" min="0" max="255" value={r} onChange={event => setColour(chrCol.set('rgb.r', event.target.value).hex())} />
        </label>
        <label>
          G:
          <input type="number" min="0" max="255" value={g} onChange={event => setColour(chrCol.set('rgb.g', event.target.value).hex())} />
        </label>
        <label>
          B:
          <input type="number" min="0" max="255" value={b} onChange={event => setColour(chrCol.set('rgb.b', event.target.value).hex())} />
        </label>
      </div>
      <div className="fieldsetrow">
        <HslPicker hslColour={hslObj} setHslColour={setHslColour} />
      </div>
    </fieldset>
  );  
}

function NewColourSelection({onSubmit}){
  const [colour, setColour] = useState(getRandomSaturedColour());
  
  const handleSubmit = event => {
    event.preventDefault();
    onSubmit(colour);
    setColour(getRandomSaturedColour());
  };

  return(
    <form onSubmit={handleSubmit}>
      <ColourSelection colour={colour} setColour={setColour} />
      <button type="submit">Add</button>
    </form>
  );
}

function ColourList({colours, setColours, selected, setSelected}){
  let elList = colours.map((colour, index) => {
    const selectedClass = index === selected ? 'selected' : '';
    return (
      <li className={selectedClass} key={index} >
        <button type="button">
          <ColourSwatch colour={colour} />
        </button>
      </li>
    )
  });

  return (
    <ul className="ColourList">
      {elList}
    </ul>
  );
}

function ColourListSelection({colours, setColours}){
  const [selected, setSelected] = useState(0);

  const changeSelectedColour = (newColour) => {
    let allColours = [...colours];
    allColours[selected] = newColour;
    setColours(allColours);
  };

  const addNewColour = (newColour) => {
    setColours([...colours, newColour]);
  };

  return (
    <Fragment>
      <ColourList colours={colours} selected={selected} setColours={setColours} setSelected={setSelected} />

      <NewColourSelection onSubmit={addNewColour} />
    </Fragment>
  );
}

function ColourMatcher({title, headingLevel}){
  const [steps, setSteps] = useState(3);
  const [colours, setColours] = useState([ getRandomSaturedColour() ]);

  const black = 'black';
  const lstarScale = createLStarScale(steps);
  const greyscale = createGreyScale(lstarScale);

  let scaleDirection = 'horizontal';
  let otherDirection = 'vertical';

  const colourScales = colours.map((colour, index) => {
    const scale = createColourScale(colour, lstarScale);
    const hueLabel = getHueName(chroma(colour).get('hsl.h'));
    
    return (
      <BaseColourScale key={index} base={colour} scale={scale} direction={scaleDirection} label={hueLabel} />      
    )
  });

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
          {colourScales}
        </tbody>
      </table>
      <div className="ColourMatcherSelection">
        <GreyScaleSelection steps={steps} setSteps={setSteps} />
        <ColourListSelection colours={colours} setColours={setColours} />
      </div>
    </div>
  );
}

export default ColourMatcher;
