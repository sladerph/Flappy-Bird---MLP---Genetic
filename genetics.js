var population = [];

var pop_size = 25;

var mutation_rate = 0.05;
var max_mutation = 0.5;

var nb_inputs = 6;
var nb_hidden = [5, 5, 5];
var nb_outputs = 1;

var top_fitness = 0;
var current_top_fitness = 0;
var top_score = 0;
var current_top_score = 0;
var top_distance = 0;

var last_best_player = undefined;

var leader_inputs = new Array(nb_inputs);

var generation = 0;

function displayGeneration() {
  fill(0);
  stroke(0);
  textSize(25);
  text("Generation " + generation, 10, 100);
}

function evolve() {
  console.log("*** Evolving... ***");

  for (var i = 0; i < population.length; i++) {
    if (population[i].leader) {
      population[i].leader = false;
      break;
    }
  }

  processFitness();

  var children = [];
  var best = selectBestOne();
  if (last_best_player != undefined) {
    if (last_best_player.fitness > population[best].fitness) {
      best = -1;
      console.log("*** NOT A NEW BEST ***");
    } else {
      last_best_player = population[best];
      console.log("*** WE HAVE A NEW BEST ***");
    }
  } else {
    last_best_player = population[best];
  }
  var child = new Bird(screen_w / 4, screen_h / 2, nb_inputs, nb_hidden, nb_outputs);
  if (best != -1) {
    var len = population[best].brain.weights.length;
    for (var p = 0; p < len; p++) {
      child.brain.weights[p] = population[best].brain.weights[p].copy();
    }
  } else {
    var len = last_best_player.brain.weights.length;
    for (var p = 0; p < len; p++) {
      child.brain.weights[p] = last_best_player.brain.weights[p].copy();
    }
  }
  child.col = color(0, 255, 0);
  child.leader = true;
  child.visualizing = true;
  children.push(child);

  // Create mating pool.
  var mating_pool = [];
  for (var i = 0; i < population.length; i++) {
    var b = population[i];
    var n = floor(map(b.fitness, 0, current_top_fitness, 0, 100));
    //console.log("N : ", n)
    for (var j = 0; j < n; j++) {
      mating_pool.push(population[i]);
    }
  }

  while (children.length < pop_size) {
    // Pick two random parents based on their fitness.
    var i1 = floor(random(0, mating_pool.length));
    var i2 = floor(random(0, mating_pool.length));

    var p1 = mating_pool[i1];
    var p2 = mating_pool[i2];
    //console.log(p1);
    var child = crossover(p1, p2);

    var len = child.brain.weights.length;
    for (var p = 0; p < len; p++) {
      child.brain.weights[p].map(mutate);
    }

    children.push(child);
  }

  children.splice(children.length - 1, 1);
  var child = new Bird(screen_w / 4, screen_h / 2, nb_inputs, nb_hidden, nb_outputs); // RANDOM ONE.
  children.push(child);

  var tmp = children[0];
  children[0] = children[children.length - 1];
  children[children.length - 1] = tmp;

  restart(children);
}

function mutate(x) {
  var rand = Math.random();
  var nx = x;
  if (rand <= mutation_rate) {
    nx += random(-max_mutation, max_mutation);
    console.log("# MUTATION #");
  }
  return nx;
}

function restart(np) {
  pipes = [];
  var h = random(pMinH, pMaxH);
  var p = new Pipe(h, screen_w);
  pipes.push(p);

  population = copyArray(np);

  current_top_score = 0;
  current_top_fitness = 0;

  slidingRate = 2;
  //slidingRate = 5;
  t_score = 0;

  generation++;

  console.log("==== NEW GENERATION (", generation, ") ====");
}

function crossover(a, b) {
  var len = a.brain.weights.length;
  for (var p = 0; p < len; p++) {
    var arr_a = matrixToArray(a.brain.weights[p]);
    var w_a = a.brain.weights[p].copy();
    var w_b = b.brain.weights[p].copy();

    var k = 0;

    var rand = floor(random(1, arr_a.length));
    for (var i = 0; i < w_a.rows; i++) {
      for (var j = 0; j < w_a.cols; j++) {
        if (k < rand) {
          var temp = w_a.data[i][j];
          w_a.data[i][j] = w_b.data[i][j];
          w_b.data[i][j] = temp;
          k++;
        }
      }
    }
  }

  var child = new Bird(screen_w / 4, screen_h / 2, nb_inputs, nb_hidden, nb_outputs);

  var len = a.brain.weights.length;
  if (floor(random(0, 2)) === 0) {
    for (var p = 0; p < len; p++) {
      child.brain.weights[p] = a.brain.weights[p].copy();
    }
  } else {
    for (var p = 0; p < len; p++) {
      child.brain.weights[p] = b.brain.weights[p].copy();
    }
  }

  return child;
}

function selectBestOne() {
  var best = 0;
  for (var i = 0; i < population.length; i++) {
    var b = population[i];
    if (b.fitness > population[best].fitness) {
      best = i;
    }
  }
  return best;
}

function processFitness() {
  for (var i = 0; i < population.length; i++) {
    population[i].calculateFitness();
  }
}

function displayScore() {
  fill(255, 255, 0);
  stroke(255, 255, 0);
  if (current_top_score == top_score) {
    fill(0, 255, 0);
    stroke(0, 255, 0);
  }
  textSize(50);

  textAlign(CENTER, TOP);

  text("Score : " + current_top_score.toString(), screen_w / 2, 50);

  fill(255);
  stroke(255);
  text("Top score : " + top_score.toString(), screen_w / 2, 0);

  textAlign(LEFT);

  if (t_score == 10 && slidingRate < maxSR) {
    slidingRate += 0.5;
    t_score = 0;
  }
}

function areBirdsAllDead() {
  for (var i = 0; i < population.length; i++) {
    if (!population[i].dead) {
      return false;
    }
  }
  return true;
}

function moveAndDrawBirds() {
  for (var i = 0; i < population.length; i++) {
    var bird = population[i];
    if (!bird.dead) {
      bird.applyForce(gravity);
      bird.update();

      var inputs = [bird.pos.y, bird.velocity.y, slidingRate];

      var n_pipe = findNextPipe(bird);
      var d = n_pipe.x - bird.pos.x + bird.radius / 2; // Distance to the next pipe.
      inputs.push(d);

      d = bird.pos.y - bird.radius / 2 - (screen_h - n_pipe.height - holeSize / 2); // Distance to the center of the next pipe.
      inputs.push(d);

      var next_n_pipe = findNextNextPipe(bird);
      if (next_n_pipe != -1) {
        d = bird.pos.y - bird.radius / 2 - (screen_h - next_n_pipe.height - holeSize / 2);
        inputs.push(d);
      } else {
        inputs.push(100);
      }

      var output = bird.brain.feedForward(inputs);

      if (bird.leader) {
        leader_inputs = inputs;
      }

      if (output[0] >= 0.5) { // JUMP !
        var force = createVector(0, -9);
        bird.applyForce(force);
        bird.update();
        //console.log("Bird " + i + " jumped !");
      }

      bird.distance += slidingRate;

      if (bird.checkHit()) {
        bird.dead = true;
        bird.center_dist = dist(bird.pos.x, bird.pos.y, n_pipe.x + width, screen_h - n_pipe.height - holeSize / 2);
        if (bird.leader) {
          console.log("Bird " + i + " HIT (LEADER) !!");
        } else {
          console.log("Bird " + i + " HIT !!");
        }
        if (bird.visualizing) {
          bird.visualizing = false;
          findNewBirdToVisualize();
        }
      }

      if (!disable_graphics_checkbox.checked()) {
        //if (bird.visualizing) {
          bird.show();
        //}

        if (visualize_inputs_checkbox.checked() && bird.visualizing) {
          fill(255);
          stroke(255);
          var x = n_pipe.x + n_pipe.width;
          var y = screen_h - n_pipe.height - holeSize / 2;
          ellipse(x, y, 10);
          line(0, y, screen_w, y);

          var y = bird.pos.y - bird.radius / 2;
          line(0, y, screen_w, y);

          fill(0);
          stroke(0);
          line(bird.pos.x, y, bird.pos.x, screen_h - n_pipe.height - holeSize / 2);

          fill(255);
          stroke(255);
          line(n_pipe.x, 0, n_pipe.x, screen_h);
          line(bird.pos.x + bird.radius / 2, 0, bird.pos.x + bird.radius / 2, screen_h);

          fill(0);
          stroke(0);
          line(bird.pos.x + bird.radius / 2, bird.pos.y, n_pipe.x, bird.pos.y);

          fill(255, 0, 0);
          stroke(255, 0, 0);
          var x = bird.pos.x - bird.radius / 2;
          var y = bird.pos.y;
          line(x, y, x, y + bird.velocity.y * 25);

          if (next_n_pipe != -1) {
            x = next_n_pipe.x + next_n_pipe.width;
            y = screen_h - next_n_pipe.height - holeSize / 2;
            fill(255);
            stroke(255);
            ellipse(x, y, 10);

            line(0, y, screen_w, y);

            fill(0);
            stroke(0);
            line(bird.pos.x + bird.radius / 2, bird.pos.y - bird.radius / 2, bird.pos.x + bird.radius / 2, y);
          }
        }
      }
    }
  }
}

function findNextPipe(b) {
  for (var i = 0; i < pipes.length; i++) {
    if (pipes[i].passed == false) {
      return pipes[i];
    }
  }
}

function findNextNextPipe(b) {
  if (pipes.length > 2) {
    var p = pipes.indexOf(findNextPipe(b));
    return pipes[p + 1];
  } else {
    return -1;
  }
}

function initBirds() {
  var b = []
  for (var i = 0; i < pop_size; i++) {
    b.push(new Bird(screen_w / 4, screen_h / 2, nb_inputs, nb_hidden, nb_outputs));
  }
  b[b.length - 1].leader = true;
  b[b.length - 1].visualizing = true;
  b[b.length - 1].col = color(0, 255, 0);

  return b;
}

function copyArray(arr) {
  var n = [];
  for (var i = 0; i < arr.length; i++) {
    n.push(arr[i]);
  }
  return n;
}

function findNewBirdToVisualize() {
  for (var i = 0; i < population.length; i++) {
    if (population[i].dead == false) {
      population[i].visualizing = true;
      return;
    }
  }
}


//