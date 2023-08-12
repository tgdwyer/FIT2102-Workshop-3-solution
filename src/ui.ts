import { fromEvent, interval, zip } from 'rxjs';
import { tap, scan, map, reduce, mergeMap, zipWith  } from 'rxjs/operators';
import { Card, count$, shoe$, deckSize, Count } from './exercises'

const button = document.getElementById('hit-me-button')!,
      body = document.getElementsByTagName('body')[0]!,
      cardDisplay = document.getElementById('card-display')!,
      countDisplay = document.getElementById('count-display')!,
      shoeSize = 5;

/**
 * Exercise 5: create a stream of something and Count
 * triggered by a button press
 */
fromEvent(button, 'mouseup').pipe(mergeMap(
  _=>interval(200).pipe(
    zipWith(count$(shoeSize,shoe$(shoeSize)))
  )
))
.subscribe(([_,count])=>{
  const cardColour
          = ['♦','♥'].includes(count.card.suit)
            ? "red"
            : "black";
  cardDisplay.innerHTML
    = `Card dealt:<br><span id="cardspan" style="color:${cardColour}">${count.card.suit}${count.card.rank}</span>`

  if (count.cardsDealt===shoeSize * deckSize) 
    return; // count is not sensible (NaN) when all cards are dealt

  const countColour = count.trueCount < 0 
                      ? "#93c5df" 
                      : count.trueCount > 0 
                        ? "#f4a581" 
                        : "antiquewhite";
  countDisplay.innerHTML = `True count = <span style="color:${countColour}">${count.trueCount}</span>`
  addBar(count, countColour);
})

/**
 * Adds a bar to the SVG chart for the given Count
 * Creates the SVG if this is the first card dealt
 * @param count 
 * @param colour colour to use
 */
function addBar(count: Count, colour: string) {
  const chart = count.cardsDealt === 1 
    ? createSVG()
    : <unknown>document.getElementById('chart')! as SVGSVGElement;
  const chartBounds = chart.getBoundingClientRect()
      , bar = document.createElementNS(chart.namespaceURI, "rect")
      , height = 1 + Math.abs(count.trueCount) * 2
      , width = chartBounds.width / (shoeSize * deckSize)
      , x = count.cardsDealt * width
      , yMid = chartBounds.height / 2
      , y = count.trueCount < 0
    ? yMid
    : count.trueCount > 0
      ? yMid - height : yMid - 0.5;
  bar.setAttribute('x', String(x));
  bar.setAttribute('y', String(y));
  bar.setAttribute('width', String(width));
  bar.setAttribute('height', String(height));
  bar.setAttribute('fill', colour);
  chart.appendChild(bar);
}

/**
 * replaces the old SVG with a new one.
 * old SVG is removed from page, new one added.
 * @returns a new SVG replacing the old one
 */
function createSVG(): SVGSVGElement {
  const oldChart = document.getElementById('chart')
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
      , body = document.getElementsByTagName("body")[0]
  svg.setAttribute('id','chart')
  if(oldChart) {
    body.removeChild(oldChart)
  }
  body.appendChild(svg)
  return svg;
}