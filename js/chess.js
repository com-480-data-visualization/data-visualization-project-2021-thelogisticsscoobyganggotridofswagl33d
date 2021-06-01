function chess_to_xy(pos) {
  let letter = pos[0];
  let number = pos[1];
  return [letter.charCodeAt(0) - 'a'.charCodeAt(0), 8 - number];
}
function xy_to_chess(x, y) {
  return String.fromCharCode(x + 'a'.charCodeAt(0)) + String(8 - y);
}

function clamp(x, m, M) {
  return Math.min(Math.max(x, m), M);
}


let folder = '/data-visualization-project-2021-thelogisticsscoobyganggotridofswagl33d/'

class Chessboard {

  constructor(div, size, blackColor, whiteColor) {
    this.initial_state = {
      'wr-L': 'a1', 'wn-L': 'b1', 'wb-L': 'c1', 'wq':   'd1', 'wk':   'e1', 'wb-R': 'f1', 'wn-R': 'g1', 'wr-R': 'h1',
      'wp-a': 'a2', 'wp-b': 'b2', 'wp-c': 'c2', 'wp-d': 'd2', 'wp-e': 'e2', 'wp-f': 'f2', 'wp-g': 'g2', 'wp-h': 'h2',
      'bp-a': 'a7', 'bp-b': 'b7', 'bp-c': 'c7', 'bp-d': 'd7', 'bp-e': 'e7', 'bp-f': 'f7', 'bp-g': 'g7', 'bp-h': 'h7',
      'br-L': 'a8', 'bn-L': 'b8', 'bb-L': 'c8', 'bq':   'd8', 'bk':   'e8', 'bb-R': 'f8', 'bn-R': 'g8', 'br-R': 'h8'
    }

    this.state = JSON.parse(JSON.stringify(this.initial_state));

    this.mapping = (piece) => folder + 'sprites/' + piece[0] + piece[1] +'.png'

    this.cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    this.rows = [1, 2, 3, 4, 5, 6, 7, 8];

    this.size = size;
    this.tileSize = size / 8;
    this.pieceProportion = 0.7;

    this.scale = d3.scaleLinear().domain([0, 8]).range([0, size]);
    this.scale.clamp(true);

    this.svg = d3.select(div).append("svg")
          .attr("width", size)
          .attr("height", size)
          .attr("display", "block")
          .attr("margin", "auto");

    this.tilesGroup = this.svg.append("g").attr("id", "tiles");
    this.cols.forEach(l => {
      this.rows.forEach(n => {
        let [x, y] = chess_to_xy(l + String(n));
        this.tilesGroup.append("rect")
            .attr('class', 'tile')
            .attr("width", this.tileSize)
            .attr("height", this.tileSize)
            .attr("x", this.scale(x))
            .attr("y", this.scale(y))
            .attr("fill", (x + y) % 2 == 1 ? blackColor : whiteColor)
            .attr("stroke-width", 0)
      })
    });

    this.colsGroup = this.svg.append("g").attr("id", "cols");
    this.cols.forEach(l => {
      let [x, y] = chess_to_xy(l + '1');
      this.colsGroup.append("text")
        .attr('class', 'col')
        .attr("x", this.scale(x) + 0.825 * this.tileSize)
        .attr("y", this.scale(y) + 0.95 * this.tileSize)
        .attr("fill", (x + y) % 2 == 0 ? blackColor : whiteColor)
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .attr("font-size", 20)
        .text(l);
    });

    this.rowsGroup = this.svg.append("g").attr("id", "rows");
    this.rows.forEach(n => {
      let [x, y] = chess_to_xy('a' + String(n));
      this.rowsGroup.append("text")
        .attr('class', 'row')
        .attr("x", this.scale(x) + 5)
        .attr("y", this.scale(y) + 0.225 * this.tileSize)
        .attr("fill", (x + y) % 2 == 0 ? blackColor : whiteColor)
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .attr("font-size", 20)
        .text(String(n));
    });

    this.heatmapGroup = this.svg
        .append('g')
        .attr('id', 'heatmap')

    this.flowGroup = this.svg
        .append('g')
        .attr('id', 'flows');

    this.piecesGroup = this.svg.append("g").attr("id", "pieces");
    this.drawPieces();
  }

  showOpening(moves) {
    if (this.openingInterval || moves.length == 0) {
      return;
    }

    let i = 0;
    if (JSON.stringify(this.state) == JSON.stringify(this.initial_state)) {
      this.movePiece(moves[i][0], moves[i][1]);
      this.drawPieces();
      i += 1;
    }
    else {
      this.reset();
    }
    this.openingInterval = d3.interval(() => {
      if (i < moves.length) {
        this.movePiece(moves[i][0], moves[i][1]);
        this.drawPieces();
        i += 1;
      } else {
        this.openingInterval.stop();
        return;
      }
    }, 750);
  }

  centerPosition(pos, d=0) {
    let [x, y] = chess_to_xy(pos)
    x = this.scale(x) + (1-d)/2 * this.tileSize;
    y = this.scale(y) + (1-d)/2 * this.tileSize;
    return [x, y]
  }

  centerPiece(pos) {
    return this.centerPosition(pos, this.pieceProportion)
  }

  drawPieces() {
    let pieces = this.piecesGroup
      .selectAll(".piece")
      .data(Object.keys(this.state), d => d);

    pieces.exit()
      .transition("fading")
      .duration(200)
      .remove();

    pieces.transition("moving")
      .duration(250)
      .ease(d3.easeLinear)
        .attr("x", (piece) => this.centerPiece(this.state[piece])[0])
        .attr("y", (piece) => this.centerPiece(this.state[piece])[1]);

    this.enter = pieces.enter()
      .append("image")
        .attr("class", "piece")
        .attr("id", (piece) => piece)
        .attr("href", (piece) => this.mapping(piece))
        .attr("height", 0)
        .attr("width", 0)
        .attr("z-index", 1)
        .attr("x", (piece) => this.centerPosition(this.state[piece])[0])
        .attr("y", (piece) => this.centerPosition(this.state[piece])[1]);

    this.enter.transition("arriving")
      .duration(250)
      .ease(d3.easeLinear)
        .attr("height", this.pieceProportion * this.tileSize)
        .attr("width", this.pieceProportion * this.tileSize)
        .attr("x", (piece) => this.centerPiece(this.state[piece])[0])
        .attr("y", (piece) => this.centerPiece(this.state[piece])[1]);

    /*
    THIS PART ALLOWS TO DRAG A PIECE, MAYBE UNNECESSARY
    let self_ = this;

    function dragged(piece) {
      d3.select(this)
        .raise()
        .attr("x", clamp(d3.event.x, 0, self_.size) - 0.35 * self_.tileSize)
        .attr("y", clamp(d3.event.y, 0, self_.size) - 0.35 * self_.tileSize);
    }

    function dragended(piece) {
      let position = self_.xy_screen_to_colrow(d3.event.x, d3.event.y);
      let [x, y] = self_.centerPiece(position);

      if (position != self_.state[piece]) {
        let victim = self_.capture(position);
        if (victim != null) {
          d3.select("#" + victim).remove();
        }
      }

      d3.select(this)
        .attr("x", x)
        .attr("y", y);

      self_.movePiece(piece, position);
    }

    this.enter.call(
      d3.drag()
        .on("drag", dragged)
        .on("end", dragended)
    )
    */
  }
  /*
  tutorial(piece) {
    let pos = this.state[piece];
    this.state = {};
    this.state[piece] = pos;
    this.drawPieces();
  }
  */


  xy_screen_to_colrow(x, y) {
    // Retrieve the chess coordinates closest to the given x-y screen coordinates
    x = x - this.tileSize / 2;
    y = y + this.tileSize / 2;

    x = this.scale.invert(x);
    y = this.scale.invert(y);

    x = Math.round(x);
    y = 8 - Math.round(y);

    x = clamp(x, 0, 7);
    y = clamp(y, 0, 7);

    return String(this.cols[x]) + String(this.rows[y])
  }

  capture(position) {
    let res = null;
    Object.keys(this.state).forEach(k => {
      if (this.state[k] == position) {
        delete this.state[k];
        res = k;
      }
    })
    return res;
  }

  movePiece(piece, position, draw=true) {
    if (position == null) {
      delete this.state[piece];
    }
    else {
      this.capture(position);
      this.state[piece] = position;
    }
    if (draw) {
      this.drawPieces();
    }
  }

  reset(draw=true) {
    this.state = JSON.parse(JSON.stringify(this.initial_state));
    if (draw) {
      this.drawPieces();
    }
  }

  showFlow(piece, flows, progressbar) {
    // Removing anything created previously
    if (this.flowInterval != null) {
      this.flowInterval.stop();
    }
    this.svg.selectAll('.flow').remove();
    this.svg.selectAll('.heat').remove();

    // Hiding all pieces except the selected one
    this.svg.selectAll('.piece').attr('opacity', 0.1);
    this.svg.select('#' + piece).attr('opacity', 1);

    let lineGenerator = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        //.curve(d3.curveCardinal.tension(0.4));

    // Taking a set of sub-samples (for performance)
    let sampleSize = 2000;
    flows = _.sampleSize(flows, Math.min(sampleSize, flows.length));

    // A function to create random jitter to the x-y positions of the flows
    let jitter = () => this.tileSize / 3 * (Math.random() - 0.5)

    // An object with entries: time -> [[from, to], [from, to], ...]
    let timeIndexedFlows = _.groupBy(flows.flatMap(f => f.positions), x => x[0])
    for (const key in timeIndexedFlows) {
      timeIndexedFlows[key] = timeIndexedFlows[key].flatMap(([tp, l]) => l.length == 2 ? [l] : [])
      if (timeIndexedFlows[key].length == 0) {
        delete timeIndexedFlows[key]
      }
    }
    // A list with all time steps where there is a change for this piece
    let Ts = Object.keys(timeIndexedFlows);
    let T = Ts[Ts.length - 1];

    let [minStroke, maxStroke] = [2, this.tileSize / 6]
    let scale = d3.scalePow().exponent(-0.05).domain([1, sampleSize]).range([maxStroke, minStroke])
    let strokeWidth = scale(flows.length)

    let i = 0;
    let callback = () => {
      if (i < Ts.length) {
        console.time(`t = ${Ts[i]}`)
        timeIndexedFlows[Ts[i]].forEach(l => {
          this.flowGroup
            .append('path')
              .attr('class', 'flow')
              .attr('stroke', 'cyan')
              .attr('stroke-width', strokeWidth)
              .attr('opacity', 0.1)
              .attr('fill', 'none')
              .attr('z-index', 0)
              .attr('d', lineGenerator(l.map(e => this.centerPosition(e).map(c => c + jitter()))))
        })

        progressbar.text(`move ${Ts[i]} / ${T}`)
        console.timeEnd(`t = ${Ts[i]}`)
        this.flowInterval = d3.timeout(callback, 200 / Math.sqrt(Ts[i]+1));
        i ++;
      }
    }

    this.flowInterval = d3.timeout(callback, 100);
  }

  showHeatmap(piece, data, colorbar) {
    // Removing anything created previously
    if (this.flowInterval != null) {
      this.flowInterval.stop()
    }
    this.svg.selectAll('.flow').remove();
    this.svg.selectAll('.heat').remove();
    colorbar.selectAll('#color-axis').remove();
    colorbar.selectAll('#color-gradient').remove();
    colorbar.selectAll('#colorbar-label').remove();

    // Computing the heatmap
    let heatmap = {}
    this.cols.forEach(c => {
      this.rows.forEach(r => {
          heatmap[`${c}${r}`] = 0;
      })
    })
    data.forEach(d => {
      heatmap[d.pos] += 1
    })

    let m = d3.min(Object.values(heatmap))
    let M = d3.max(Object.values(heatmap))
    let colorScale = d3.scaleLog()
        .domain([0.5, M])
        .range([0, 1])

    Object.keys(heatmap).forEach(pos => {
      heatmap[pos] = colorScale(heatmap[pos] == 0 ? 0.5 : heatmap[pos]);
    })
    /*this.heatmapGroup
        .selectAll('.heat')
        .data(Object.keys(heatmap))
        .enter()
        .append('rect')
            .lower()
            .attr('class', 'heat')
            .attr('width', pos => Math.sqrt(heatmap[pos]) * this.tileSize)
            .attr('height', pos => Math.sqrt(heatmap[pos]) * this.tileSize)
            .attr("x", pos => this.centerPosition(pos, Math.sqrt(heatmap[pos]))[0])
            .attr("y", pos => this.centerPosition(pos, Math.sqrt(heatmap[pos]))[1])
            .attr('fill', 'red')//pos => heatmap[pos] < 0.1 ? 'none' : d3.interpolateViridis(heatmap[pos]))
            .attr("stroke-width", 0)
            */

      let barHeight = 0.97 * this.size;
      let yScale = d3.scaleLog()
          .domain([1, M])
          .range([barHeight-5, 0])

      colorbar.append('text')
          .attr('id', 'colorbar-label')
          .attr('fill', 'white')
          .attr('font-size', 12)
          .attr('x', 20)
          .attr('y', 15)
          .text('# of games');
      colorbar.append('g')
          .attr('transform', `translate(40, ${this.size - barHeight})`)
          .attr('id', 'color-axis')
          .attr('class', 'axisWhite')
          .call(d3.axisLeft(yScale).tickFormat(d3.format(".1s")))

      let lines = [];
      for (let i = 0.0; i < barHeight; i++) {
        lines.push(i / barHeight);
      }
      colorbar.append('g')
          .attr('id', 'color-gradient')
          .attr('transform', `translate(40, ${this.size - barHeight})`)
          .selectAll('rect')
          .data(lines)
          .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', d => d * barHeight)
            .attr('width', 50)
            .attr('height', 1)
            .attr('stroke', 'none')
            .attr('fill', d => d3.interpolateViridis(1 - d))

      this.heatmapGroup
          .selectAll('.heat')
          .data(Object.keys(heatmap))
          .enter()
          .append('rect')
              .lower()
              .attr('class', 'heat')
              .attr('width', pos => this.tileSize)
              .attr('height', pos =>  this.tileSize)
              .attr("x", pos => this.centerPosition(pos, 1)[0])
              .attr("y", pos => this.centerPosition(pos, 1)[1])
              .attr('fill', pos => d3.interpolateViridis(heatmap[pos]))
              .attr('stroke', 'black')
              .attr('stroke-width', 1)
  }
}


function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
  let size = 0.4 * window.innerWidth;


  // OPENINGS
  let tutorial = new Chessboard('#tutorial-chess-container', size, "#0090bb", "#b2edff");

  // OPENINGS
  let openingBoard = new Chessboard('#opening-chess-container', size, "#AA5454", "#EEAAAA");

  d3.json(folder + "data/openings.json", function (error, data) {
    let selector = d3.select("#opening-selector")

    selector.selectAll(".opening")
      .attr("class", "btn btn-primary opening")
      .data(Object.keys(data).sort(), d => d)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d)


    let curr = 0;
    let states = data[selector.property("value")].states;

    selector.on("change", () => {
      curr = 0;
      states = data[selector.property("value")].states
      if (openingInterval != null) {
        openingInterval.stop();
        openingInterval = undefined;
      }
      openingBoard.reset()
    })

    let openingInterval = undefined;

    function back() {
      if (openingInterval == null && curr > 0) {
        curr -= 1;
        openingBoard.state = JSON.parse(JSON.stringify(states[curr]));
        openingBoard.drawPieces();
      }
    }

    function next() {
      if (openingInterval == null && curr < states.length - 1) {
        curr += 1;
        openingBoard.state = JSON.parse(JSON.stringify(states[curr]));
        openingBoard.drawPieces();
      }
    }

    function play() {
      if (openingInterval == null) {
        if (curr < states.length - 1) {
          next();
        } else {
          openingBoard.reset();
          curr = 0;
        }
        openingInterval = d3.interval(() => {
          if (curr < states.length - 1) {
            curr += 1;
            openingBoard.state = JSON.parse(JSON.stringify(states[curr]));
            openingBoard.drawPieces();
          } else {
            openingInterval.stop();
            openingInterval = undefined;
            return;
          }
        }, 750);
      }
    }

    let buttons = d3.select("#opening-buttons")

    buttons.append("button")
      .attr("id", "button-back")
      .attr("class", "btn btn-primary opening")
      .text("back")
      .on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
      .on("mouseout",  function(d){d3.select(this).style("cursor", null)})
      .on("click", back)

    buttons.append("button")
      .attr("id", "button-play")
      .attr("class", "btn btn-primary opening")
      .style("margin-left", "10%")
      .style("margin-right", "10%")
      .text("play")
      .on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
      .on("mouseout",  function(d){d3.select(this).style("cursor", null)})
      .on("click", play)

    buttons.append("button")
      .attr("id", "button-next")
      .attr("class", "btn btn-primary opening")
      .text("next")
      .on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
      .on("mouseout",  function(d){d3.select(this).style("cursor", null)})
      .on("click", next)

  })


  // FLOWS
  let flowBoard = new Chessboard('#flow-chess-container', size, "#545454", "#AAAAAA");

  flowBoard.enter.on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
      .on("mouseout", function(d){d3.select(this).style("cursor", null)});

  d3.json(folder + 'data/elo.json', function (error, data) {
    let colorbar = d3.select('#heatmap-colorbar')
        .append('svg')
        .attr('height', size)
        .attr('width', 50 + 40)
    let progressbar = d3.select('#flow-info')

    let brushWidth = 50;
    let brushHeight = 0.97 * size;
    let elobar = d3.select('#elo-bar')
        .append('div')
        .attr('clear', 'both')
        .append('svg')
        .attr('width', brushWidth + 40)
        .attr('height', size)

    let minELO = 816;
    let maxELO = 2475;

    let selectedElo = [minELO, maxELO];

    let eloscale = d3.scaleLinear()
        .domain([minELO, maxELO])
        .range([0, brushHeight])

    let brush = d3.brushY()
        .extent([[0, 0], [brushWidth, brushHeight]])
        .on('brush', function() {
          let [y1, y2] = d3.event.selection;
          selectedElo = [eloscale.invert(y1), eloscale.invert(y2)]
        })

    let eloAxis = d3.axisRight()
        .scale(eloscale)

    // Drawing the axis
    elobar.append('g')
        .attr('transform', `translate(${brushWidth}, ${size - brushHeight - 1})`)
        .attr('id', 'eloAxis')
        .attr('class', 'axisWhite')
        .call(eloAxis)

    // Drawing the histogram
    let maxY = d3.max(data, d => d.y)
    elobar.append('g')
        .attr('id', 'eloHistogram')
        .selectAll('.bar')
        .data(data)
        .enter()
          .append('rect')
            .attr('x', 0)
            .attr('y', d => eloscale(d.x))
            .attr('width', d => d.y / maxY * brushWidth)
            .attr('height', d => brushHeight / data.length - 1)
            .attr('fill', 'steelblue')

    elobar.append('g')
        .append('text')
        .attr('class', 'eloLabel')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('x', 10)
        .attr('y', 15)
        .text('ELO');

    // Drawing the brush
    elobar.append('g')
        .attr('transform', `translate(0, ${size - brushHeight - 1})`)
        .attr('id', 'eloBrush')
        .call(brush)
        .call(brush.move, [0, brushHeight]);

    flowBoard.enter.on("click", piece => {

      colorbar.selectAll('#color-axis').remove();
      colorbar.selectAll('#color-gradient').remove();
      colorbar.selectAll('#colorbar-label').remove();

      d3.json(folder + "data/flows/" + piece + '.json', function (error, data) {
        let winner = d3.select('input[name="winner"]:checked').node().value;
        d3.select('#heatmap-button')
            .text('Show me the end position heatmap')
        let filtered = data.flatMap(game => (selectedElo[0] <= game.ELO && game.ELO <= selectedElo[1] && (winner == "all" || winner == game.win)) ? [game] : [])
        flowBoard.showFlow(piece, filtered, progressbar)

        d3.select('#heatmap-button')
              .on('click', () => {
                d3.json(folder + 'data/endposition/' + piece + '.json', function (error, data) {
                  winner = d3.select('input[name="winner"]:checked').node().value;
                  filtered = data.flatMap(game => (selectedElo[0] <= game.ELO && game.ELO <= selectedElo[1] && (winner == "all" || winner == game.win)) ? [game] : []);
                  flowBoard.showHeatmap(piece, filtered, colorbar);
                })
              })
              .on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
              .on("mouseout",  function(d){d3.select(this).style("cursor", null)})
      })
    })
  })

});
