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
  const role = isBase ? 'rowheader' : 'gridcell';
  return (
    <div className={classes} style={ {backgroundColor: colour} } role={role} aria-label={label}></div>
  );
}

function ColourScale({colours, direction}){
  return (
    <div className={direction}>
      {colours.map(colour => (
        <ColourSwatch colour={colour} key={colour} />
      ))}
    </div>
  );
}

function BaseColourScale({base, scale, direction, label}){
  return (
    <div className={`BaseColourScale ${direction}`} role="row">
      <ColourSwatch colour={base} isBase="true" label={label} />
      <ColourScale colours={scale} direction={direction} />
    </div>
  );
}

function ColourMatcher({title, headingLevel}){
  let black = 'black';
  let greyscale = calculateGreyscale(3);
  const hue = Math.floor(Math.random() * 360);
  const hueLabel = getHueName(hue);
  const base = chroma.hsl(hue, 1, .5);
  let scale = calculateColourScale(base, greyscale);
  let scaleDirection = 'horizontal';
  let otherDirection = 'vertical';
  const Heading = headingLevel <= 6 ? `h${headingLevel}` : 'p';
  return (
    <div className="ColourMatcher">
      <Heading id="colourmatcher">{title}</Heading>
      <div className={otherDirection} role="grid" aria-labelledby="colourmatcher">
        <BaseColourScale base={black} scale={greyscale} direction={scaleDirection} label="greyscale" />
        <BaseColourScale base={base} scale={scale} direction={scaleDirection} label={hueLabel} />      
      </div>
    </div>
  );
}

export default ColourMatcher;