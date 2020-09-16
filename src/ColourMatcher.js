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

function ColourSwatch({colour, isBase}){
  let classes = 'swatch';
  classes = isBase ? [classes, 'base'].join(' ') :  classes;
  return (
    <div className={classes} style={ {backgroundColor: colour} }></div>
  );
}

function ColourLabel({colour}){
  return (
    <div className="ColourLabel"><code>{colour}</code></div>
  );
}

function ScaleSwatch({colour}){
  return(
    <Fragment>
      <ColourSwatch colour={colour} />
      <ColourLabel colour={colour} />
    </Fragment>
  );
}

function ColourScale({colours, direction}){
  const result = colours.map(colour => (
        <td key={colour}>
          <ScaleSwatch colour={colour} />
        </td>
      ));
  return result;
}

function BaseColourScale({base, scale, direction, label}){
  return (
    <tr className={`BaseColourScale ${direction}`} role="row">
      <th scope="row" aria-label={label}><ScaleSwatch colour={base} /></th>
      <ColourScale colours={scale} direction={direction} />
    </tr>
  );
}

function HeaderRow({headers}){
  return (
    <tr>
      {headers.map(header => (<th scope="col" key={header}>{header}</th>))}
    </tr>
  );
}

function GreyScaleSelection({steps, setSteps}){
  return (
    <fieldset>
      <legend>Greyscale Options</legend>
      <div>
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
  const maxLength = 7;


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
    <input className={ isValid ? '' : 'error' } type="text" pattern={hexPattern} value={value} size={maxLength} maxLength={maxLength}
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
    <div className="stack">
      <div>
        <label>
          HEX:
          <HexInput colour={colour} setColour={setColour} />
        </label>
      </div>
      <div>
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
      <div>
        <HslPicker hslColour={hslObj} setHslColour={setHslColour} />
      </div>
    </div>
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
      <fieldset>
        <legend>New Color</legend>
        <div className="NewColourSelection">
          <ColourSelection colour={colour} setColour={setColour} />
          <div className="stack">
            <ColourSwatch colour={colour} />
            <button type="submit" aria-label={`Add ${colour} to the base color selection`}>Add</button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

function ColourList({colours, setColours, announce}){
  const removeColour = index => {
    let colArr = [...colours.slice(0, index), ...colours.slice(index + 1)];
    setColours(colArr);
    announce(`Color ${colours[index]} was removed from the base color selection`);
  };

  let elList = colours.map((colour, index) => {
    return (
      <li key={index} >
        <div className="ColourItem">
          <ColourSwatch colour={colour} />
          <span>{colour}</span>
        </div>
        <button type="button" aria-label={`remove ${colour}`} onClick={() => removeColour(index)} >
          Remove
        </button>
      </li>
    )
  });

  return (
    <div className="ColourListBox">
      <ul className="ColourList">
        {elList}
      </ul>
      <div className="ColourListEmpty">
        <p>You haven't selected any base colors</p>
        <p>To generate a color scale matching the selected greyscale, add a color to your selection &#x2193;</p>
      </div>
    </div>
  );
}

function ColourListSelection({colours, setColours, announce}){
  
  const addNewColour = (newColour) => {
    setColours([...colours, newColour]);
    announce(`Color ${newColour} was added to the base color selection`);
  };

  return (
    <Fragment>
      <ColourList colours={colours} setColours={setColours} announce={announce} />
      <NewColourSelection onSubmit={addNewColour} />
    </Fragment>
  );
}

function LiveStatus({messages}){
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-relevant="additions">
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}

function ColourMatcher({title, headingLevel}){
  const [steps, setSteps] = useState(3);
  const [colours, setColours] = useState([ getRandomSaturedColour() ]);
  const [messages, setMessages] = useState([]);

  const black = 'black';
  const lstarScale = createLStarScale(steps);
  const greyscale = createGreyScale(lstarScale);

  let scaleDirection = 'horizontal';
  let otherDirection = 'vertical';

  const sendMessage = message => {
    setMessages([...messages, message]);
  };

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
      <LiveStatus messages={messages} />
      <table className={otherDirection} role="table" aria-labelledby="colourmatcher">
        <caption id="colourmatcher"><Heading>{title}</Heading></caption>
        <thead>
          <HeaderRow headers={headers}/>
        </thead>
        <tbody>
          <BaseColourScale base={black} scale={greyscale} direction={scaleDirection} label="greyscale" />
          {colourScales}
        </tbody>
      </table>
      <div className="ColourMatcherSelection">
        <h3>Greyscale</h3>
        <GreyScaleSelection steps={steps} setSteps={setSteps} />
        <h3>Base Colors</h3>
        <ColourListSelection colours={colours} setColours={setColours} announce={sendMessage} />
      </div>
    </div>
  );
}

export default ColourMatcher;
