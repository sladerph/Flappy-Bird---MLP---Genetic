function Matrix(rows, cols) {
  this.rows = rows;
  this.cols = cols;
  this.data = [];

  for (var i = 0; i < this.rows; i++) {
    this.data[i] = [];
    for (var j = 0; j < this.cols; j++) {
      this.data[i][j] = 0;
    }
  }
}

Matrix.prototype.randomize = function(min, max) {
  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      this.data[i][j] = Math.floor(Math.random() * (max - min) + min);
    }
  }
}

Matrix.prototype.multiply = function(n) {
  if (n instanceof Matrix) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        this.data[i][j] *= n.data[i][j];
      }
    }
  } else {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        this.data[i][j] *= n;
      }
    }
  }
}

Matrix.prototype.add = function(n) {
  if (n instanceof Matrix) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        this.data[i][j] += n.data[i][j];
      }
    }
  } else {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        this.data[i][j] += n;
      }
    }
  }
}

Matrix.prototype.substract = function(n) {
  if (n instanceof Matrix) {
    if (this.rows == n.rows && this.cols == n.cols) {
      for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
          this.data[i][j] -= n.data[i][j];
        }
      }
    }
  } else {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        this.data[i][j] -= n;
      }
    }
  }
}

Matrix.prototype.transpose = function() {
  var m = new Matrix(this.cols, this.rows);

  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      m.data[j][i] = this.data[i][j];
    }
  }
  return m;
}

Matrix.prototype.print = function() {
  console.table(this.data);
}

Matrix.prototype.map = function(f) {
  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      this.data[i][j] = f(this.data[i][j]);
    }
  }
}

Matrix.prototype.dotProduct = function(b) {
  if (b instanceof Matrix) {
    if (this.cols == b.rows) {
      var c = new Matrix(this.rows, b.cols);
      for (var i = 0; i < c.rows; i++) {
        for (var j = 0; j < c.cols; j++) {
          for (var k = 0; k < this.cols; k++) {
            c.data[i][j] += this.data[i][k] * b.data[k][j];
          }
        }
      }
      return c;
    } else {
      console.log("The Matrix can't be multiplied !");
    }
  }
}

Matrix.prototype.copy = function() {
  var a = new Matrix(this.rows, this.cols);
  for (var i = 0; i < a.rows; i++) {
    for (var j = 0; j < a.cols; j++) {
      a.data[i][j] = this.data[i][j];
    }
  }
  return a;
}

Matrix.prototype.length = function() {
  var arr = matrixToArray(this);
  return arr.length;
}

function matrixFromArray(a) {
  var mat = new Matrix(a.length, 1);
  for (var i = 0; i < a.length; i++) {
    mat.data[i][0] = a[i];
  }
  return mat;
}

function matrixToArray(mat) {
  var arr = [];
  for (var i = 0; i < mat.rows; i++) {
    for (var j = 0; j < mat.cols; j++) {
      arr.push(mat.data[i][j]);
    }
  }
  return arr;
}

//