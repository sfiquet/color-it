import React from 'react';
import chroma from 'chroma-js';
import './ColourMatcher.css';

function calculateGreyscale(steps){
  return ['#cccccc', '#888888', '#444444'];
}
function calculateColourScale(base, greyscale){
  return greyscale;
}
function getHueName(hue){
  return 'random';
}

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

function ColourMatcher({title, headingLevel}){
  let black = 'black';
  let greyscale = calculateGreyscale(3);
  const hue = Math.floor(Math.random() * 360);
  const hueLabel = getHueName(hue);
  const base = chroma.hsl(hue, 1, .5);
  const base2 = chroma.hsl((hue + 180) % 360, 1, .5);
  let scale = calculateColourScale(base, greyscale);
  let scale2 = calculateColourScale(base2, greyscale);
  let scaleDirection = 'horizontal';
  let otherDirection = 'vertical';
  const Heading = headingLevel <= 6 ? `h${headingLevel}` : 'p';
  const headers = ['Base', '25%', '50%', '75%'];
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
    </div>
  );
}

export default ColourMatcher;