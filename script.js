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

class Chessboard {

  constructor(div, size, blackColor, whiteColor) {
    this.initial_state = {
      'wr-L': 'a1', 'wn-L': 'b1', 'wb-L': 'c1', 'wq':   'd1', 'wk':   'e1', 'wb-R': 'f1', 'wn-R': 'g1', 'wr-R': 'h1',
      'wp-a': 'a2', 'wp-b': 'b2', 'wp-c': 'c2', 'wp-d': 'd2', 'wp-e': 'e2', 'wp-f': 'f2', 'wp-g': 'g2', 'wp-h': 'h2',
      'bp-a': 'a7', 'bp-b': 'b7', 'bp-c': 'c7', 'bp-d': 'd7', 'bp-e': 'e7', 'bp-f': 'f7', 'bp-g': 'g7', 'bp-h': 'h7',
      'br-L': 'a8', 'bn-L': 'b8', 'bb-L': 'c8', 'bq':   'd8', 'bk':   'e8', 'bb-R': 'f8', 'bn-R': 'g8', 'br-R': 'h8'
    }

    this.state = JSON.parse(JSON.stringify(this.initial_state));

    this.mapping = (piece) => '/sprites/' + piece[0] + piece[1] +'.png'

    this.cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    this.rows = [1, 2, 3, 4, 5, 6, 7, 8];

    this.size = size;
    this.tileSize = size / 8;

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
            .attr("width", this.tileSize)
            .attr("height", this.tileSize)
            .attr("x", this.scale(x))
            .attr("y", this.scale(y))
            .attr("fill", (x + y) % 2 == 1 ? blackColor : whiteColor)
            .attr("stroke-width", 0)
            .attr("stroke", "rgb(0,0,0)")
      })
    });

    this.colsGroup = this.svg.append("g").attr("id", "cols");
    this.cols.forEach(l => {
      let [x, y] = chess_to_xy(l + '1');
      this.colsGroup.append("text")
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
        .attr("x", this.scale(x) + 5)
        .attr("y", this.scale(y) + 0.225 * this.tileSize)
        .attr("fill", (x + y) % 2 == 0 ? blackColor : whiteColor)
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .attr("font-size", 20)
        .text(String(n));
    });

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

  centerPiece(pos) {
    let x = this.scale(chess_to_xy(pos)[0]) + 0.15 * this.tileSize;
    let y = this.scale(chess_to_xy(pos)[1]) + 0.15 * this.tileSize;
    return [x, y]
  }

  centerPosition(pos) {
    let x = this.scale(chess_to_xy(pos)[0]) + 0.5 * this.tileSize;
    let y = this.scale(chess_to_xy(pos)[1]) + 0.5 * this.tileSize;
    return [x, y]
  }

  drawPieces() {
    let pieces = this.piecesGroup
      .selectAll(".piece")
      .data(Object.keys(this.state), d => d);

    pieces.exit()
      .transition()
      .duration(200)
      .remove();

    pieces.transition()
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
        .attr("x", (piece) => this.centerPiece(this.state[piece])[0] + 0.35 * this.tileSize)
        .attr("y", (piece) => this.centerPiece(this.state[piece])[1] + 0.35 * this.tileSize);

    this.enter.transition()
      .duration(250)
      .ease(d3.easeLinear)
        .attr("height", 0.7 * this.tileSize)
        .attr("width", 0.7 * this.tileSize)
        .attr("x", (piece) => this.centerPiece(this.state[piece])[0])
        .attr("y", (piece) => this.centerPiece(this.state[piece])[1]);

    this.enter.on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
        .on("mouseout",  function(d){d3.select(this).style("cursor", null)});


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
  }

  tutorial(piece) {
    let pos = this.state[piece];
    this.state = {};
    this.state[piece] = pos;
    this.drawPieces();
  }

  xy_screen_to_colrow(x, y) {
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
    if (this.flowInterval) {
      this.flowInterval.stop();
    }
    this.svg.selectAll('.flow').remove();

    // Hiding all pieces except the selected one
    this.svg.selectAll('.piece').attr('opacity', 0.15);
    this.svg.select('#' + piece).attr('opacity', 1);

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveCardinal.tension(0.4));

    // Taking a set of sub-samples (for performance)
    flows = _.sampleSize(flows, Math.min(1000, flows.length));

    // A function to create random jitter to the x-y positions of the flows
    let jitter = () => this.tileSize / 6 * (Math.random() - 0.5)

    let T = d3.max(flows, d => d3.max(d.positions.map(([t, l]) => t)));
    progressbar.text('0 / ' + String(T))
    let paths = {};
    let t = 0;
    let [rx, ry] = [0, 0]
    this.flowInterval = d3.interval(() => {
      if (t <= T) {
        flows.forEach((f, i) => {
          if (f.positions.length > 0) {
            if (f.positions[0][0] == t) {
              [rx, ry] = [jitter(), jitter()]
              paths[i] = {
                random: [rx, ry],
                data: f.positions[0][1].map(d => {
                  let [x, y] = this.centerPosition(d);
                  return {x: x + jitter(), y: y + jitter()}
                })
              }
            }
            else {
              f.positions.slice(1).forEach(([tp, l], j) => {
                if (tp == t) {
                  if (l.length == 1 || j == f.positions.length - 2) {
                    delete paths[i]
                  }
                  else {
                    let [x, y] = this.centerPosition(l[1]);
                    [rx, ry] = paths[i].random;
                    paths[i].data = paths[i].data.concat({x: x + jitter(), y: y + jitter()})
                  }
                }
              })
            }
            if (i in paths) {
              if ('svg' in paths[i]) {
                paths[i].svg.remove()
              }
              paths[i].svg = this.flowGroup
                .append('path')
                  .attr('class', 'flow')
                  .attr('stroke', 'cyan')
                  .attr('stroke-width', 2 * 1000 / flows.length)
                  .attr('opacity', 0.2)
                  .attr('fill', 'none')
                  .attr('z-index', 2)
                  .attr('d', line(paths[i].data));
            }
          }
        })
        progressbar.text(String(t) + ' / ' + String(T))
        t ++;
      }
      else {
        this.flowInterval.stop();
        return;
      }
    }, 100);
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
  let size = 800;

  // OPENINGS
  let openingBoard = new Chessboard('#opening-chess-container', size, "#AA5454", "#EEAAAA");

  d3.json("data/openings.json", function (error, data) {
    let selector = d3.select("#opening-selector")

    selector.selectAll(".opening")
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
      if (openingInterval) {
        openingInterval.stop();
      }
      openingBoard.reset()
    })

    let openingInterval = undefined;

    function back() {
      if (openingInterval != null && curr > 0) {
        curr -= 1;
        openingBoard.state = JSON.parse(JSON.stringify(states[curr]));
        openingBoard.drawPieces();
      }
    }

    function next(skip=false) {
      if (openingInterval != null && curr < states.length - 1) {
        curr += 1;
        openingBoard.state = JSON.parse(JSON.stringify(states[curr]));
        openingBoard.drawPieces();
      }
    }

    let buttons = d3.select("#opening-buttons")

    buttons.append("button")
      .attr("id", "button-back")
      .text("back")
      .on("click", back)
      .on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
      .on("mouseout",  function(d){d3.select(this).style("cursor", null)})

    buttons.append("button")
      .attr("id", "button-play")
      .text("play")
      .on("click", () => {
        if (openingInterval != null) {return;}
        if (curr < states.length - 1) {
          next();
        }
        else {
          openingBoard.reset();
          curr = 0;
        }
        openingInterval = d3.interval(() => {
          if (curr < states.length - 1) {
            next()
          } else {
            openingInterval.stop();
            openingInterval = undefined;
            return;
          }
        }, 750);
      })
      .on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
      .on("mouseout",  function(d){d3.select(this).style("cursor", null)})

    buttons.append("button")
      .attr("id", "button-next")
      .text("next")
      .on("click", next)
      .on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
      .on("mouseout",  function(d){d3.select(this).style("cursor", null)})

  })

  // FLOWS
  let progressbar = d3.select('#flow-info')
  let elobar = d3.select('#flow-controller')
      .append('svg')
      .attr('width', 0.9 * size + 2)
      .attr('height', 40)

  let minELO = 816;
  let maxELO = 2475;

  let selectedElo = [minELO, maxELO];

  let eloscale = d3.scaleLinear()
      .domain([minELO, maxELO])
      .range([0, 0.9 * size])

  let brush = d3.brushX()
      .extent([[0, 0], [0.9 * size, 35]])
      .on('brush', function() {
        let [x1, x2] = d3.event.selection;
        selectedElo = [eloscale.invert(x1), eloscale.invert(x2)]
      })

  let eloAxis = d3.axisBottom()
      .scale(eloscale)

  elobar
      .append('g')
      .attr('id', 'eloAxis')
      .attr('class', 'axisWhite')
      .call(eloAxis)

  elobar.append('g')
      .attr('id', 'eloBrush')
      .call(brush)
      .call(brush.move, [0, 0.9*size])


  let flowBoard = new Chessboard('#flow-chess-container', size, "#545454", "#AAAAAA");
  flowBoard.enter.on("click", d => {
    d3.json("data/flows/" + d + '.json', function (error, data) {
      let filtered = data.flatMap(game => (selectedElo[0] <= game.ELO && game.ELO <= selectedElo[1]) ? [game] : [])
      flowBoard.showFlow(d, filtered, progressbar)
    })
  })

});
