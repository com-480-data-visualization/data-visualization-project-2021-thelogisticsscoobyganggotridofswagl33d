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

class Chessboard {

  constructor(size, blackColor, whiteColor) {
    this.initial_state = {
      'R-L': 'a1', 'N-L': 'b1', 'B-L': 'c1', 'Q':   'd1', 'K':   'e1', 'B-R': 'f1', 'N-R': 'g1', 'R-R': 'h1',
      'P-a': 'a2', 'P-b': 'b2', 'P-c': 'c2', 'P-d': 'd2', 'P-e': 'e2', 'P-f': 'f2', 'P-g': 'g2', 'P-h': 'h2',
      'p-a': 'a7', 'p-b': 'b7', 'p-c': 'c7', 'p-d': 'd7', 'p-e': 'e7', 'p-f': 'f7', 'p-g': 'g7', 'p-h': 'h7',
      'r-L': 'a8', 'n-L': 'b8', 'b-L': 'c8', 'q':   'd8', 'k':   'e8', 'b-R': 'f8', 'n-R': 'g8', 'r-R': 'h8'
    }

    this.state = JSON.parse(JSON.stringify(this.initial_state));

    this.mapping = (piece) => '/sprites/' + piece[0] + '.png'

    this.cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    this.rows = [1, 2, 3, 4, 5, 6, 7, 8];

    this.size = size;
    this.tileSize = size / 8;

    this.scale = d3.scaleLinear().domain([0, 8]).range([0, size]);

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
    this.reset();

    let i = 0;
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

    u.enter()
      .append("image")
        .classed("piece", true)
        .attr("id", (piece) => piece)
        .attr("href", (piece) => this.mapping(piece))
        .attr("height", 0.7 * this.tileSize)
        .attr("width", 0.7 * this.tileSize)
        .attr("x", this.size / 2)
        .attr("y", this.size / 2)
        .transition()
        .duration(250)
        .ease(d3.easeLinear)
          .attr("x", (piece) => this.centerPiece(this.state[piece])[0])
          .attr("y", (piece) => this.centerPiece(this.state[piece])[1]);

  }

  movePiece(piece, position) {
    if (position == null) {
      delete this.state[piece];
    }
    else {
      Object.keys(this.state).forEach(k => {
        if (this.state[k] == position) {
          delete this.state[k];
        }
      })
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
    'moves': [['P-e', 'e4'], ['p-d', 'd5'], ['P-e', 'd5'], ['q', 'd5'], ['N-L', 'c3']],
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
