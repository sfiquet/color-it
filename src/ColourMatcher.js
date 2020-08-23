import React from 'react';
import chroma from 'chroma-js';
import './ColourMatcher.css';

function calculateGreyscale(steps){
  return ['#cccccc', '#888888', '#444444'];
}
function calculateColourScale(base, greyscale){
  return greyscale;
}

function ColourSwatch({colour, isBase}){
  let classes = 'swatch';
  classes = isBase ? [classes, 'base'].join(' ') :  classes;
  return (
    <div className={classes} style={ {backgroundColor: colour} }></div>
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

function BaseColourScale({base, scale, direction}){
  return (
    <div className={`BaseColourScale ${direction}`}>
      <ColourSwatch colour={base} isBase="true" />
      <ColourScale colours={scale} direction={direction} />
    </div>
  );
}

function ColourMatcher(){
  let black = 'black';
  let greyscale = calculateGreyscale(3);
  let base = chroma.hsl(Math.floor(Math.random() * 360), 1, .5);
  let scale = calculateColourScale(base, greyscale);
  let scaleDirection = 'horizontal';
  let otherDirection = 'vertical';
  return (
    <div className={`ColourMatcher ${otherDirection}`}>
      <BaseColourScale base={black} scale={greyscale} direction={scaleDirection} />
      <BaseColourScale base={base} scale={scale} direction={scaleDirection} />      
    </div>
  );
}

export default ColourMatcher;