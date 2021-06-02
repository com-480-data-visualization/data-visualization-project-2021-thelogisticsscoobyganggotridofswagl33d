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
let deploy = false
let folder

if (deploy) {
  folder = '/data-visualization-project-2021-thelogisticsscoobyganggotridofswagl33d/'
} else {
  folder = '/'
}


class Chessboard {

  constructor(div, size, blackColor, whiteColor) {
    this.initial_state = {
      'wr-L': 'a1',
      'wn-L': 'b1',
      'wb-L': 'c1',
      'wq': 'd1',
      'wk': 'e1',
      'wb-R': 'f1',
      'wn-R': 'g1',
      'wr-R': 'h1',
      'wp-a': 'a2',
      'wp-b': 'b2',
      'wp-c': 'c2',
      'wp-d': 'd2',
      'wp-e': 'e2',
      'wp-f': 'f2',
      'wp-g': 'g2',
      'wp-h': 'h2',
      'bp-a': 'a7',
      'bp-b': 'b7',
      'bp-c': 'c7',
      'bp-d': 'd7',
      'bp-e': 'e7',
      'bp-f': 'f7',
      'bp-g': 'g7',
      'bp-h': 'h7',
      'br-L': 'a8',
      'bn-L': 'b8',
      'bb-L': 'c8',
      'bq': 'd8',
      'bk': 'e8',
      'bb-R': 'f8',
      'bn-R': 'g8',
      'br-R': 'h8'
    }

    this.state = JSON.parse(JSON.stringify(this.initial_state));

    this.mapping = (piece) => folder + 'sprites/' + piece[0] + piece[1] + '.png'

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
    } else {
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

  centerPosition(pos, d = 0) {
    let [x, y] = chess_to_xy(pos)
    x = this.scale(x) + (1 - d) / 2 * this.tileSize;
    y = this.scale(y) + (1 - d) / 2 * this.tileSize;
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

  movePiece(piece, position, draw = true) {
    if (position == null) {
      delete this.state[piece];
    } else {
      this.capture(position);
      this.state[piece] = position;
    }
    if (draw) {
      this.drawPieces();
    }
  }

  reset(draw = true) {
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
    this.svg.selectAll('.heat').remove();
    this.svg.selectAll('.flow').remove();

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
        this.flowInterval = d3.timeout(callback, 200 / Math.sqrt(Ts[i] + 1));
        i++;
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

    let barHeight = 0.97 * this.size;
    let barWidth = this.size / 10;
    let yScale = d3.scaleLog()
      .domain([1, M])
      .range([barHeight - 5, 0])

    colorbar.selectAll('#color-axis').remove();
    colorbar.selectAll('#color-gradient').remove();
    colorbar.selectAll('#colorbar-label').remove();

    colorbar.append('text')
      .attr('id', 'colorbar-label')
      .attr('fill', 'white')
      .attr('font-size', 12)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('x', 20 + barWidth /  2)
      .attr('y', (this.size - barHeight) / 2)
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
      .attr('width', barWidth)
      .attr('height', 1)
      .attr('stroke', 'none')
      .attr('fill', d => d3.interpolateViridis(1 - d))

    this.svg.selectAll('.heat').remove();
    this.heatmapGroup
      .selectAll('.heat')
      .data(Object.keys(heatmap))
      .enter()
      .append('rect')
      .lower()
      .attr('class', 'heat')
      .attr('width', pos => this.tileSize)
      .attr('height', pos => this.tileSize)
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
  let size = Math.min(0.4 * window.innerWidth, 0.7 * window.innerHeight);

  let minELO = 816;
  let maxELO = 2475;

  // Tutorial
  let tutorialBoard = new Chessboard('#tutorial-chess-container', size, "#0090bb", "#b2edff");

  d3.select('#tutorial-pieces').style('margin-top', `${tutorialBoard.tileSize}px`)

  d3.json(folder + 'data/tutorial.json', function(error, tutorialData) {

    let tutorialTimer = undefined;

    function tutorial(piece) {
      if (tutorialTimer != null) {
        tutorialTimer.stop();
      }

      function loop(i) {
        if (i < tutorialData[piece].simulation.length) {
          tutorialBoard.state = JSON.parse(JSON.stringify(tutorialData[piece].simulation[i]));
          tutorialBoard.drawPieces();
          tutorialTimer = d3.timeout(() => loop(i + 1), 1000);
        } else {
          tutorialBoard.state = {};
          tutorialBoard.drawPieces();
          tutorialTimer = d3.timeout(() => loop(0), 1000);
        }
      }
      tutorialBoard.state = {};
      tutorialBoard.drawPieces();
      tutorialTimer = d3.timeout(() => loop(0), 300);
    }


    let pieceSelector = d3.select('#tutorial-piece-selector')
      .attr('width', tutorialBoard.tileSize)
      .attr('height', 6 * tutorialBoard.tileSize)

    let pieces = ['bk-t', 'wq-t', 'br-t', 'wn-t', 'bb-t', 'wp-t'];

    pieceSelector.append('g')
      .selectAll('.tutorial-tile')
      .data(pieces)
      .enter()
      .append("rect")
      .attr('id', piece => `tile-${piece}`)
      .attr("class", 'tutorial-tile')
      .attr("fill", "none")
      .attr("height", tutorialBoard.tileSize)
      .attr("width", tutorialBoard.tileSize)
      .attr('x', (piece, i) => tutorialBoard.centerPosition(`a${8-i}`, 1)[0])
      .attr('y', (piece, i) => tutorialBoard.centerPosition(`a${8-i}`, 1)[1])
      .attr('rx', 25)
      .attr('ry', 25);


    pieceSelector.append('g')
      .attr('transform', 'translate(2, 2)')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', tutorialBoard.tileSize - 4)
      .attr('height', 6 * tutorialBoard.tileSize - 4)
      .attr('rx', 20)
      .attr('ry', 20)
      .attr('fill', 'none')
      .attr('stroke', '#0090bb')
      .attr('stroke-width', '4px');

    pieceSelector.append('g')
      .selectAll('.tutorial-piece')
      .data(pieces)
      .enter()
      .append("image")
      .attr('id', piece => piece)
      .attr("class", 'tutorial-piece')
      .attr("href", piece => tutorialBoard.mapping(piece))
      .attr("height", tutorialBoard.pieceProportion * tutorialBoard.tileSize)
      .attr("width", tutorialBoard.pieceProportion * tutorialBoard.tileSize)
      .attr('x', (piece, i) => tutorialBoard.centerPiece(`a${8-i}`)[0])
      .attr('y', (piece, i) => tutorialBoard.centerPiece(`a${8-i}`)[1])
      .on("mouseover", function(d) {
        d3.select(this).style("cursor", "pointer")
      })
      .on("mouseout", function(d) {
        d3.select(this).style("cursor", null)
      })
      .on("click", piece => {
        let pieceType = piece[1];
        d3.select('#piece-name').text(`The ${tutorialData[pieceType].name}`);
        d3.select('#piece-description').text(tutorialData[pieceType].description);
        d3.selectAll('.tutorial-tile').attr('fill', 'none')
        d3.select(`#tile-${piece}`).attr('fill', '#b2edff');
        tutorial(pieceType);
      })

  })

  // OPENINGS
  let openingBoard = new Chessboard('#opening-chess-container', size, "#AA5454", "#EEAAAA");

  d3.json(folder + "data/openings.json", function(error, data) {
    let selector = d3.select("#opening-selector").attr("class", "btn btn-primary opening opening-selector")

    selector.selectAll(".opening")
      .data(Object.keys(data).sort(), d => d)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d)


    let openingInterval = undefined;

    function showOpeningStats(opening) {
      d3.selectAll('#svg-elo').remove();
      d3.selectAll('#svg-winrate').remove();

      let info = data[opening];
      d3.select('#opening-title').text(`The ${opening}`).style("font-weight", "bold").style("font-size", "22px")
      d3.select('#opening-games')
        .text(`Played in ${info.nb_games} games out of 20k.`)

      d3.select('#opening-moves')
        .text(info.opening_moves)

      let histogramHeight = 0.1 * window.innerHeight;
      let winrateHeight = histogramHeight / 3;
      let barsWidth = 0.25 * window.innerWidth;

      let elo = d3.select('#opening-elo')
        .append('svg')
        .attr('id', 'svg-elo')
        .attr('height', histogramHeight + 20)
        .attr('width', barsWidth)

      let hundred = (d) => Math.floor(d / 100) * 100;
      let nBars = (hundred(maxELO) - hundred(minELO)) / 100 + 1;
      let histogramScale = d3.scaleLinear()
        .domain([hundred(minELO), hundred(maxELO) + 100])
        .range([0, barsWidth])

      let histogram = Array.from(Object.entries(_.groupBy(info.elo, hundred))).map(([e, l]) => [Number(e), l.length]);
      let yMax = d3.max(histogram, d => d[1]);

      elo.append('g')
        .attr('id', 'eloHistogram')
        .selectAll('.bar')
        .data(histogram)
        .enter()
        .append('rect')
        .attr('x', d => histogramScale(d[0]))
        .attr('y', d => histogramHeight * (yMax - d[1]) / yMax)
        .attr('width', barsWidth / nBars - 2)
        .attr('height', d => histogramHeight * d[1] / yMax)
        .attr('fill', 'steelblue');

      let axis = d3.axisBottom(histogramScale)
        .tickFormat(d3.format(".2s"))
        .tickValues(_.range(nBars - 1).map(d => hundred(minELO) + 100 * (d + 1)));

      elo.append('g')
        .attr('id', 'eloHistogramAxis')
        .attr('transform', `translate(0, ${histogramHeight})`)
        .attr('class', 'axisWhite')
        .call(axis);


      let openingWinrate = d3.select('#opening-winrate')
        .append('svg')
        .attr('id', 'svg-winrate')
        .attr('height', winrateHeight)
        .attr('width', barsWidth)

      let b = barsWidth * info.winner_black / 100;
      let d = barsWidth * info.draw / 100;
      let w = barsWidth * info.winner_white / 100;

      openingWinrate.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', b)
        .attr('height', winrateHeight)
        .attr('fill', '#262626');

      openingWinrate.append('rect')
        .attr('x', b)
        .attr('y', 0)
        .attr('width', d)
        .attr('height', winrateHeight)
        .attr('fill', '#606060');

      openingWinrate.append('rect')
        .attr('x', b + d)
        .attr('y', 0)
        .attr('width', w)
        .attr('height', winrateHeight)
        .attr('fill', 'white');

      if (info.winner_black >= 10) {
        openingWinrate.append('text')
          .attr('x', b / 2)
          .attr('y', winrateHeight / 2)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          .attr('fill', '#8c8a88')
          .text(d3.format('.0%')(info.winner_black / 100))
      }
      if (info.draw >= 10) {
        openingWinrate.append('text')
          .attr('x', b + d / 2)
          .attr('y', winrateHeight / 2)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          .attr('fill', '#8c8a88')
          .text(d3.format('.0%')(info.draw / 100))
      }
      if (info.winner_white >= 10) {
        openingWinrate.append('text')
          .attr('x', b + d + w / 2)
          .attr('y', winrateHeight / 2)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          .attr('fill', '#8c8a88')
          .text(d3.format('.0%')(info.winner_white / 100))
      }
    }

    let opening = selector.property("value");
    let states = data[opening].states;
    let curr = 0;
    showOpeningStats(opening);

    function showOpening(opening) {
      states = data[opening].states;
      curr = 0;
      if (openingInterval != null) {
        openingInterval.stop();
        openingInterval = undefined;
      }
      openingBoard.reset()
      showOpeningStats(opening);
    }

    selector.on("change", () => {
      opening = selector.property("value");
      showOpening(opening);
    })

    d3.select('#opening-random')
      .attr("class", "btn btn-primary opening")
      .on("mouseover", function(d) {
        d3.select(this).style("cursor", "pointer")
      })
      .on("mouseout", function(d) {
        d3.select(this).style("cursor", null)
      })
      .on("click", () => {
        let randomOpening = _.sample(Object.keys(data));
        let sel = selector.node()
        for (let i = 0; i < sel.length; i++) {
          if (sel[i].childNodes[0].nodeValue === randomOpening) {
            sel.selectedIndex = i;
            break;
          }
        }
        showOpening(randomOpening)
      })

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
      .on("mouseover", function(d) {
        d3.select(this).style("cursor", "pointer")
      })
      .on("mouseout", function(d) {
        d3.select(this).style("cursor", null)
      })
      .on("click", back)

    buttons.append("button")
      .attr("id", "button-play")
      .attr("class", "btn btn-primary opening")
      .text("play")
      .on("mouseover", function(d) {
        d3.select(this).style("cursor", "pointer")
      })
      .on("mouseout", function(d) {
        d3.select(this).style("cursor", null)
      })
      .on("click", play)

    buttons.append("button")
      .attr("id", "button-next")
      .attr("class", "btn btn-primary opening")
      .text("next")
      .on("mouseover", function(d) {
        d3.select(this).style("cursor", "pointer")
      })
      .on("mouseout", function(d) {
        d3.select(this).style("cursor", null)
      })
      .on("click", next)

  })


  // FLOWS
  let flowBoard = new Chessboard('#flow-chess-container', size, "#005900", "#b0cc7a")

  d3.json(folder + 'data/elo.json', function(error, data) {
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

    let selectedElo = [minELO, maxELO];
    let selectedPiece = undefined;
    let mode = d3.select('#game-mode');

    let eloscale = d3.scaleLinear()
      .domain([minELO, maxELO])
      .range([0, brushHeight])

    let brush = d3.brushY()
      .extent([
        [0, 0],
        [brushWidth, brushHeight]
      ])
      .on('end', function() {
        let [y1, y2] = d3.event.selection;
        selectedElo = [eloscale.invert(y1), eloscale.invert(y2)]
        setVizualization(selectedPiece);
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
      .attr('transform', `translate(0, ${size - brushHeight - 1})`)
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
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('x', brushWidth / 2)
      .attr('y', (size - brushHeight) / 2)
      .text('ELO');

    // Drawing the brush
    elobar.append('g')
      .attr('transform', `translate(0, ${size - brushHeight - 1})`)
      .attr('id', 'eloBrush')
      .call(brush)
      .call(brush.move, [0, brushHeight]);


    function setVizualization(piece) {
      if (piece == null) return;
      selectedPiece = piece;

      // Hiding all pieces except the selected one
      flowBoard.svg.selectAll('.piece').attr('opacity', 0.1);
      flowBoard.svg.select('#' + selectedPiece).attr('opacity', 1);

      flowBoard.svg.selectAll('.flow').remove();

      if (mode.node().checked) { // HEATMAP
        d3.json(folder + 'data/endposition/' + selectedPiece + '.json', function(error, data) {
          let winner = d3.select('input[name="winner"]:checked').node().value;
          let filtered = data.flatMap(game => (selectedElo[0] <= game.ELO && game.ELO <= selectedElo[1] && (winner == "all" || winner == game.win)) ? [game] : []);
          flowBoard.showHeatmap(selectedPiece, filtered, colorbar);
        })
      } else { // FLOW
        d3.json(folder + "data/flows/" + selectedPiece + '.json', function(error, data) {

          colorbar.selectAll('#color-axis').remove();
          colorbar.selectAll('#color-gradient').remove();
          colorbar.selectAll('#colorbar-label').remove();

          let winner = d3.select('input[name="winner"]:checked').node().value;
          let filtered = data.flatMap(game => (selectedElo[0] <= game.ELO && game.ELO <= selectedElo[1] && (winner == "all" || winner == game.win)) ? [game] : [])
          flowBoard.showFlow(selectedPiece, filtered, progressbar)
        })
      }
    }

    flowBoard.enter
      .on("mouseover", function(d) {
        d3.select(this).style("cursor", "pointer")
      })
      .on("mouseout", function(d) {
        d3.select(this).style("cursor", null)
      })
      .on("click", setVizualization)

    d3.select('#flow-options').on('change', () => setVizualization(selectedPiece));
    mode.on('change', () => setVizualization(selectedPiece));
    //d3.selectAll('input[name="winner"]').on('change', () => setVizualization(selectedPiece));

  })

});
