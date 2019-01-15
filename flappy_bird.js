var stop = false;

var score = 0;
var t_score = 0;

var bird;
var gravity;
var holeSize = screen_h / 4;

var pipes = new Array();
var pMinH = 50;
var pMaxH = screen_h - pMinH - holeSize;
var distPipes = 300;
var slidingRate = 2;
//var slidingRate = 5;
var maxSR = 5;

function drawFlappyStuff() {
  if (!stop) {
    bird.applyForce(gravity);
    bird.update();
  }
  bird.show();
  if (bird.checkHit()) {
    stop = true;
    bird.dead = true;
    console.log("HIT");
  }
  textSize(50);
  fill(255, 255, 0);
  text(score.toString(), screen_w / 2, 50);
  if (t_score == 10 && slidingRate < maxSR) {
    slidingRate += 0.5;
    t_score = 0;
  }
}

function moveAndDrawPipes() {
  if (!stop) {
    for (var i = 0; i < pipes.length; i++) {
      pipes[i].x -= slidingRate;
      if (pipes[i].x <= -(pipes[i].width)) {
        pipes.splice(i, 1);
      }
      if (!pipes[i].passed) {
        pipes[i].checkPassed();
      }
    }

    if (pipes[pipes.length - 1].x <= screen_w - distPipes) {
      var h = random(pMinH, pMaxH);
      var p = new Pipe(h, screen_w);
      pipes.push(p);
    }
  }

  if (!disable_graphics_checkbox.checked()) {
    for (var i = 0; i < pipes.length; i++) {
      pipes[i].show();
    }
  }
}

function Pipe(height, x) {
  this.height = height;
  this.width = 50;
  this.x = x;
  this.passed = false;

  this.checkPassed = function() {
    var ok = false;
    for (var i = 0; i < population.length; i++) {
      if (!population[i].dead) {
        if (population[i].pos.x - population[i].radius / 2 > this.x + this.width) {
          this.passed = true;
          population[i].score++;
          if (population[i].score >= top_score) {
            top_score = population[i].score;
          }
          if (population[i].score >= current_top_score) {
            current_top_score = population[i].score;
          }
          ok = true;
        }
      }
    }
    if (ok) {
      t_score++;
    }
  }

  this.show = function() {
    stroke(0);
    if (this.passed) {
      fill(0, 255, 0);
    } else {
      fill(255, 0, 0);
    }
    rect(this.x, 0, this.width, screen_h - this.height - holeSize);
    rect(this.x, screen_h - this.height, this.width, this.height);
  }
}

function Bird(x, y, nb_inputs, nb_hidden, nb_outputs) {
  this.pos = createVector(x, y);
  this.velocity = createVector(0, 0);
  this.acceleration = createVector(0, 0);
  this.radius = 50;
  this.dead = false;

  var r = Math.floor(random(0, 256));
  var g = Math.floor(random(0, 256));
  var b = Math.floor(random(0, 256));
  this.col = color(r, g, b);

  this.score = 0;

  this.distance = 0;
  this.fitness = 0;

  this.center_dist = 0;

  this.leader = false;
  this.visualizing = false;

  this.brain = new NeuralNetwork(nb_inputs, nb_hidden, nb_outputs);

  this.checkHit = function() {
    for (var i = 0; i < pipes.length; i++) {
      if (this.collidePipe(pipes[i])) {
        return true;
      }
    }
    if (this.pos.y + this.radius / 2 >= screen_h) {
      return true;
    }
    return false;
  }

  this.collidePipe = function(p) {
    var a = createVector(p.x, 0);
    var b = createVector(p.x, screen_h - p.height - holeSize);
    if (this.collideSegment(a, b)) {
      return true;
    }
    a.y = b.y;
    b.x += p.width;
    if (this.collideSegment(a, b)) {
      return true;
    }
    a.y = screen_h;
    b.x = p.x;
    b.y = screen_h - p.height;
    if (this.collideSegment(a, b)) {
      return true;
    }
    a.y = b.y;
    b.x += p.width;
    if (this.collideSegment(a, b)) {
      return true;
    }
    return false;
  }

  this.collideSegment = function(a, b) {
    if (this.collideLine(a, b) == false) {
      return false;
    }
    var ab = createVector(b.x - a.x, b.y - a.y);
    var ac = createVector(this.pos.x - a.x, this.pos.y - a.y);
    var bc = createVector(this.pos.x - b.x, this.pos.y - b.y);
    var scalP1 = ab.x * ac.x + ab.y * ac.y;
    var scalP2 = (-ab.x) * bc.x + (-ab.y) * bc.y;

    if (scalP1 >= 0 && scalP2 >= 0) {
      return true;
    }
    if (this.collidePoint(a)) {
      return true;
    }
    if (this.collidePoint(b)) {
      return true;
    }
    return false;
  }

  this.collidePoint = function(a) {
    var d = dist(a.x, a.y, this.pos.x, this.pos.y);
    if (d <= this.radius / 2) {
      return true;
    } else {
      return false;
    }
  }

  this.collideLine = function(a, b) {
    var u = createVector(b.x - a.x, b.y - a.y);
    var ac = createVector(this.pos.x - a.x, this.pos.y - a.y);
    var numerator = abs(u.x * ac.y - u.y * ac.x);
    var denominator = sqrt(u.x * u.x + u.y * u.y);
    var div = numerator / denominator;
    if (div <= this.radius / 2) {
      return true;
    } else {
      return false;
    }
  }

  this.applyForce = function(f) {
    this.acceleration.add(f);
  }

  this.update = function() {
    this.velocity.add(this.acceleration);

    if (this.velocity.y > 10) {
      this.velocity.y = 10;
    }
    if (this.velocity.y > 0 && this.pos.y >= (screen_h - this.radius / 2)) {
      this.velocity.y = 0;
    }
    if (this.velocity.y < -10) {
      this.velocity.y = -10;
    }
    if (this.velocity.y < 0 && this.pos.y <= (this.radius / 2)) {
      this.velocity.y = 0;
    }
    this.pos.add(this.velocity);

    this.acceleration.mult(0);

    if (this.pos.y > screen_h - this.radius / 2) {
      this.pos.y = screen_h - this.radius / 2;
    } else if (this.pos.y < this.radius / 2) {
      this.pos.y = this.radius / 2;
    }
  }

  this.show = function() {
    stroke(this.col);
    fill(this.col);
    ellipse(this.pos.x, this.pos.y, this.radius);
  }

  this.calculateFitness = function() {
    this.fitness = pow(this.distance, 2) + pow((50 / this.center_dist), 2);
    if (this.fitness > top_fitness) {
      top_fitness = this.fitness;
    }
    if (this.fitness > current_top_fitness) {
      current_top_fitness = this.fitness;
    }
    //console.log("Fit : ", this.gen_score);
  }
}

//