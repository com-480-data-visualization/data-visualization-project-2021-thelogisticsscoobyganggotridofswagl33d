margin = {top: 20, bottom: 20, left: 30, right: 30}

let width = window.innerWidth * 0.95 - margin.left - margin.right;
let height = window.innerHeight * 0.95 - margin.top - margin.bottom;

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

  constructor(size, blackColor, whiteColor) {
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

    this.svg = d3.select("#chess-container").append("svg")
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

    this.piecesGroup = this.svg.append("g").attr("id", "pieces");
    this.drawPieces();
  }

  showOpening(moves) {
    if (this.ongoing) {
      return;
    }
    this.ongoing = true;



    let i = 0;
    if (JSON.stringify(this.state) == JSON.stringify(this.initial_state)) {
      this.movePiece(moves[i][0], moves[i][1]);
      this.drawPieces();
      i += 1;
    }
    else {
      this.reset();
    }
    let interval = d3.interval(() => {
      if (i < moves.length) {
        this.movePiece(moves[i][0], moves[i][1]);
        this.drawPieces();
        i += 1;
      } else {
        interval.stop();
        this.ongoing = false;
        return;
      }
    }, 750);
  }

  centerPiece(pos) {
    let x = this.scale(chess_to_xy(pos)[0]) + 0.15 * this.tileSize;
    let y = this.scale(chess_to_xy(pos)[1]) + 0.15 * this.tileSize;
    return [x, y]
  }

  drawPieces() {
    let u = this.piecesGroup
      .selectAll(".piece")
      .data(Object.keys(this.state), d => d);

    u.exit()
      .transition()
      .duration(200)
      .remove();

    u.transition()
      .duration(250)
      .ease(d3.easeLinear)
        .attr("x", (piece) => this.centerPiece(this.state[piece])[0])
        .attr("y", (piece) => this.centerPiece(this.state[piece])[1]);

    let pieces = u.enter()
      .append("image")
        .attr("class", "piece")
        .attr("id", (piece) => piece)
        .attr("href", (piece) => this.mapping(piece))
        .attr("height", 0.7 * this.tileSize)
        .attr("width", 0.7 * this.tileSize)
        .attr("x", this.size / 2)
        .attr("y", this.size / 2);

    pieces.transition()
      .duration(250)
      .ease(d3.easeLinear)
        .attr("x", (piece) => this.centerPiece(this.state[piece])[0])
        .attr("y", (piece) => this.centerPiece(this.state[piece])[1]);

    pieces.on("mouseover", function(d){d3.select(this).style("cursor", "pointer")})
        .on("mouseout",  function(d){d3.select(this).style("cursor", null)})
        .on("click", (d) => this.tutorial(d));


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
        .attr("y", y)
        .style("z-index", null);

      self_.movePiece(piece, position);
    }

    pieces.call(
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

  movePiece(piece, position) {
    if (position == null) {
      delete this.state[piece];
    }
    else {
      this.capture(position);
      this.state[piece] = position;
    }
    this.drawPieces();
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(this.initial_state));
    this.drawPieces();
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
  let board = new Chessboard(size, "#545454", "#AAAAAA");

  let opening = {
    'moves': [['wp-e', 'e4'], ['bp-d', 'd5'], ['wp-e', 'd5'], ['bq', 'd5'], ['wn-L', 'c3']],
    'description': "e4 d52. exd5 Qxd53. Nc3",
    'name': "Scandinavian Defense: Mieses-Kotrč Variation, 3.Nc3"
  };

  let text = d3.select("#text-container")
    .append("div")
    .attr("display", "block")
    .attr("margin", "auto")
    .attr("width", "auto");


  text.selectAll("p")
      .data([opening.name, opening.description])
      .enter()
      .append("p")
      .style("color", "white")
      .text(d => d);

  text.append("button")
      .attr("class", "button")
      .style("color", "white")
      .text("Show me this opening!")
      .on("click", () => board.showOpening(opening.moves));
});
