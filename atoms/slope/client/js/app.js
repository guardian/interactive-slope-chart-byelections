import * as d3B from 'd3'

const d3 = Object.assign({}, d3B);

const atomEl = d3.select('.slope-svg-container').node()

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height =  0.6 * width;

console.log(height)

const margin = {top:30, bottom:80, left:55, right:60}

const svg = d3.select('.slope-svg-container')
.append('svg')
.attr('id', 'gv-slope-c')
.attr('width', width)
.attr('height', height);

const graph = svg.append("g")
const textsLeft = svg.append("g")
const textsRight = svg.append("g")
const years = svg.append("g")

const xScale = d3.scalePoint()
.domain([0,1])
.range([margin.left, width - margin.right])

const yScale = d3.scaleLinear()
.range([height - margin.bottom, margin.top])

const line = d3.line()
.x((d, i) => xScale(i))
.y(yScale)

// batley: https://interactive.guim.co.uk/docsdata/1LUUgz8_HrjLy64FX-lGZ01tPfETrsqsHt6lBDweQF9E.json
// bexley:https://interactive.guim.co.uk/docsdata-test/12Hn0vMuhg7PRUNXClSWz_fW6TH3Kn1uixozxNxylmjU.json 
// north shropshire: https://interactive.guim.co.uk/docsdata-test/1zQtBC3ox_GZ3S0GjeEMPQjMBO40dvTS0w2zjZLB3xZQ.json
//d3.json('<%= path %>/results.json')
var sheetpath = "https://interactive.guim.co.uk/docsdata-test/1NyLV2-ES0qVW3XJThtIXOlOqAMzGnC8VzaNEdVRWKtM.json"

d3.json(sheetpath)
.then(data => {


	let results = data.sheets.results;


	console.log(results)

	// let headline = d3.select('.headline').html(results[0].headline)

	// let source = d3.select('.source').html(results[0].source)

	let allResults = [];

	results.map(d => {

		if(+d.percentage_2019 > 0 || +d.percentage_2021 > 0)
		{
			allResults.push({
			party:d.party,
			values:[+d.percentage_2019,+d.percentage_2021],
			colour:d.colour
			})
		}

		
	})

	yScale.domain(d3.extent(allResults.flatMap(d => d.values)))

	let lines = graph.selectAll("path")
	.data(allResults)
	.enter()
	.append("path")
	.attr("d", d => line(d.values))
	.attr("stroke",d => '#' + d.colour)
	.attr("fill", "none")
	.attr("stroke-width",2.5);


	let yPositionsLeft = []
	let yPositionsRight = []
	let valuesLeft = []
	let valuesRight = []

	allResults.forEach(d => {
		d.values.forEach((e,i) =>{
			graph
			.append('circle')
			.attr('r', 4)
			.attr("fill", '#' + d.colour)
			.attr('cx', xScale(i))
			.attr('cy', yScale(+e))

			if(i%2 === 0){
				yPositionsLeft.push(yScale(+e))
				valuesLeft.push({party: d.party, value:e, colour:d.colour})
			}
			else{
				yPositionsRight.push(yScale(+e))
				valuesRight.push({party: d.party, value:e, colour:d.colour})
					
			}

		})
	})


	let positionsLeft = dodge(yPositionsLeft)
	let positionsRight = dodge(yPositionsRight)


	let labelsLeft = textsLeft.selectAll("g")
	.data(positionsLeft)
	.enter()
	.append('g')
	.attr('class', (d,i) => 'label' + i)
	.style('transform', (d,i) => `translate(${margin.left}px,${d}px)`)

	let labelsRight = textsRight.selectAll("g")
	.data(positionsRight)
	.enter()
	.append('g')
	.attr('class', (d,i) => 'label' + i)
	.style('transform', (d,i) => `translate(${width - margin.right}px,${d}px)`)


	positionsLeft.forEach((d,i) => {

			textsLeft.select('.label' + i)
			.append('text')
			.attr('class', 'slope-value')
			.attr("text-anchor", "end")
			.text(valuesLeft[i].value)
			.attr('fill' ,'#' + valuesLeft[i].colour)
			.attr('dx', '-0.5em')
			

		
	})

	positionsRight.forEach((d,i) => {

			textsRight.select('.label' + i)
			.append('text')
			.attr('class', 'slope-value')
			.attr("text-anchor", "start")
			.text(valuesRight[i].value)
			.attr('fill' ,'#' + valuesRight[i].colour)
			.attr('dy', '-1.2em')
			.attr('dx', '+0.5em')

			textsRight.select('.label' + i)
			.append('text')
			.attr('class', 'slope-party')
			.attr("text-anchor", "start")
			.text(valuesRight[i].party)
			.attr('fill' ,'#' + valuesRight[i].colour)
			.attr('dx', '+0.5em')

	})

	years.selectAll("text")
    .data([2019,2022])
    .enter()
    .append('text')
    .attr('class', 'slope-year')
    .attr("text-anchor", (d,i) => i == 0 ? "start" : 'end')
    .attr("transform", (d, i) => `translate(${xScale(i)},${yScale(0) + 15})`)
    .text(d => d);

	if(window.resize)window.resize()

})

function dodge(positions, separation = 35, maxiter = 10, maxerror = 1e-1) {
  positions = Array.from(positions);
  let n = positions.length;
  if (!positions.every(isFinite)) throw new Error("invalid position");
  if (!(n > 1)) return positions;
  let index = d3.range(positions.length);
  for (let iter = 0; iter < maxiter; ++iter) {
    index.sort((i, j) => d3.ascending(positions[i], positions[j]));
    let error = 0;
    for (let i = 1; i < n; ++i) {
      let delta = positions[index[i]] - positions[index[i - 1]];
      if (delta < separation) {
        delta = (separation - delta) / 2;
        error = Math.max(error, delta);
        positions[index[i - 1]] -= delta;
        positions[index[i]] += delta;
      }
    }
    if (error < maxerror) break;
  }
  return positions;
}


