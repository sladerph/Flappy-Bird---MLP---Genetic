var screen_w = 1000;
var screen_h = 600;

var visualize_inputs_checkbox;
var disable_graphics_checkbox;

var nb_loop = 30;

var fps;

function setup() {
  var cn = createCanvas(screen_w, screen_h);
  cn.parent('first-sketch');

  colorMode(RGB);

  gravity = createVector(0, 0.3);

  var h = random(pMinH, pMaxH);
  var p = new Pipe(h, screen_w);
  pipes.push(p);

  population = initBirds();

  visualize_inputs_checkbox = createCheckbox('Visualize inputs (for leader).', false);
  disable_graphics_checkbox = createCheckbox('Disable graphics to speed up.', false);

  //visualize_inputs_checkbox.position(0, 500);

  frameRate(60);
  fps = 60;
}

function draw() {

  background(128);

  moveAndDrawPipes(); // Calculating pipes.

  moveAndDrawBirds();

  displayScore();

  displayGeneration();

  nb_loop++;

  if (nb_loop >= 50) {
    fps = int(frameRate());
    nb_loop = 0;
  }

  textAlign(LEFT, TOP);
  fill(0);
  stroke(0);
  textSize(25);
  text("FPS : " + fps.toString(), 0, 0);


  if (areBirdsAllDead()) { // They are all dead.
    evolve();
  }

  //drawFlappyStuff();
}

function saving() {
	var b = population[24].brain;
	var txt = [];
	
	for (var p = 0; p < b.weights.length; p++) {
		var w = "";
		txt.push("b.weights[" + p.toString() + "].");
		
		for (var i = 0; i < b.weights[p].rows; i++) {
			for (var j = 0; j < b.weights[p].cols; j++) {
				w = "data[" + i.toString() + "][" + j.toString() + "] : ";
				w = w + b.weights[p].data[i][j].toString();
				txt.push(w);
			}
		}
	}
	
	save(txt, 'save-best-brain', 'dat');
}


/*
var second_sketch = function($) {
  var red_cross;

  $.preload = function() {
    red_cross = $.loadImage('red_cross.png');
  }

  $.setup = function() {
    var cn = $.createCanvas(screen_w, screen_h * 3);
    cn.position(0, screen_h + 200);

    $.frameRate(15);
  }

  $.draw = function() {
    $.background(128);

    var sx = 400;
    var sy = 50;
    var spaceX = 250;
    var spaceY = 50;
    var r = 15;
    var last_sy = 0;

    // The separation box for the leader.
    $.noFill();
    $.stroke(0);
    $.strokeWeight(4);
    $.strokeCap(SQUARE);

    $.rect(0, 0, screen_w - 1, sy + nb_hidden * spaceY);

    $.line(sx - 100, 0, sx - 100, sy + nb_hidden * spaceY)

    $.strokeWeight(1);
    $.strokeCap(ROUND);

    $.fill(0);
    $.textSize(30);
    $.textAlign(CENTER, TOP);
    $.text("Bird 24 !", (sx - 100) / 2, 20);
    $.fill(255, 255, 0);
    $.stroke(255, 255, 0);
    $.text("LEADER", (sx - 100) / 2, 100);
    // End separation box.

    for (var i = 0; i < population.length; i++) {
      if (population[i].leader) {

        var b = population[i].brain;

        var sx = 400;
        var sy = 50;
        var spaceX = 250;
        var spaceY = 50;
        var r = 15;
        var last_sy = 0;

        $.fill(population[i].col);
        $.stroke(population[i].col);
        $.ellipse((sx - 100) / 2, (sy + b.nb_hidden * spaceY) / 2, population[i].radius);

        if (!population[i].dead) {

          // *** Display the brain ***

          // Input nodes.
          var n_w_ih = b.weights_ih.copy();
          n_w_ih.map(sigmoid);

          if (b.nb_inputs < b.nb_hidden) {
            last_sy = sy;
            sy = int(((sy + b.nb_hidden * spaceY) / 2) - ((b.nb_inputs * spaceY) / 2));
          }

          for (var i = 0; i < b.nb_inputs; i++) {
            var from = $.color(255, 0, 0);
            var to = $.color(0, 255, 0);
            var col = $.lerpColor(from, to, sigmoid(leader_inputs[i]));

            $.fill(col);
            $.stroke(col);

            $.ellipse(sx, sy + i * spaceY, 2 * r);

            // Connections to hidden nodes.
            for (var j = 0; j < b.nb_hidden; j++) {
              var col = $.lerpColor(from, to, n_w_ih.data[j][i]);

              $.fill(col);
              $.stroke(col);

              $.line(sx + r, sy + i * spaceY, sx + spaceX - r, sy + j * spaceY - last_sy - last_sy / 2);
            }
          }

          // Hidden nodes.
          var input_matrix = matrixFromArray(leader_inputs);

          var hidden = b.weights_ih.dotProduct(input_matrix);
          hidden.add(b.bias_h);
          hidden.map(sigmoid); // Activation function.
          var arr_hidden = matrixToArray(hidden);

          var n_w_ho = b.weights_ho.copy();
          n_w_ho.map(sigmoid);

          sy = 50;
          if (b.nb_outputs < b.nb_hidden) {
            var o_sy = int(((sy + b.nb_hidden * spaceY) / 2) - ((b.nb_outputs * spaceY) / 2));
          }

          for (var j = 0; j < b.nb_hidden; j++) {
            var from = $.color(255, 0, 0);
            var to = $.color(0, 255, 0);

            var col = $.lerpColor(from, to, sigmoid(arr_hidden[j]));

            $.fill(col);
            $.stroke(col);

            $.ellipse(sx + spaceX, sy + j * spaceY, 2 * r);

            // Connections to output nodes.
            for (var k = 0; k < b.nb_outputs; k++) {
              var col = $.lerpColor(from, to, n_w_ho.data[k][j]);

              $.fill(col);
              $.stroke(col);

              $.line(sx + spaceX + r, sy + j * spaceY, sx + 2 * spaceX - r, o_sy + k * spaceY);
            }
          }

          // Output nodes.
          var output = b.weights_ho.dotProduct(hidden);
          output.add(b.bias_o);
          output.map(sigmoid);
          var arr_output = matrixToArray(output);

          sy = 50;
          last_sy = 0;
          if (b.nb_outputs < b.nb_hidden) {
            last_sy = sy;
            sy = int(((sy + b.nb_hidden * spaceY) / 2) - ((b.nb_outputs * spaceY) / 2));
          }

          for (var k = 0; k < b.nb_outputs; k++) {
            var from = $.color(255, 0, 0);
            var to = $.color(0, 255, 0);

            var col = $.lerpColor(from, to, sigmoid(arr_output[k]));

            $.fill(col);
            $.stroke(col);

            $.ellipse(sx + 2 * spaceX, sy + k * spaceY, 2 * r);
          }
        } else {
          var sx = 400;
          var sy = 50;
          $.textAlign(CENTER, CENTER);
          $.textSize(200);
          var x = (sx - 100) + (screen_w - (sx - 100)) / 2;
          var y = (sy + b.nb_hidden * spaceY) / 2;
          $.fill(255, 0, 0);
          $.stroke(255, 0, 0);
          $.text("DEAD", x, y);

          // Draw the red cross.
          $.fill(255, 0, 0);
          $.strokeWeight(10);
          var x = (sx - 100) / 2 - 50;
          var y = y - 50;
          //$.line(x, y, (sx - 100) - x, (sy + b.nb_hidden * spaceY) - y);
          //$.line(x, y, 3 * x, 2 * y);
          $.image(red_cross, x, y, 100, 100);
          $.strokeWeight(1);
        }
        break;
      }
    }

    var sy = 50;
    var box_w = 150;
    var box_h = 150;
    var k = 0;
    var x = 0;
    var y = sy + nb_hidden * spaceY;
    for (var i = 0; i < population.length - 1; i++) {
      if (x + box_w > screen_w - box_w) {
        x = 0;
        y += box_h;
      } else if (i) {
        x += box_w;
      }
      $.noFill();
      $.stroke(0);
      $.strokeWeight(4);
      $.rect(x, y, box_w, box_h);
      $.textAlign(LEFT, TOP);
      $.textSize(30);
      $.fill(0);
      $.strokeWeight(1);
      $.text("Bird " + i.toString(), x + 5, y + 5);
      $.fill(population[i].col);
      $.stroke(population[i].col);
      $.ellipse(x + box_w / 2, y + box_h / 2, population[i].radius);

      if (population[i].dead) {
        $.image(red_cross, x + box_w / 4, y + box_h / 4, 75, 75);
      }
    }
  }
}

var n_sketch = new p5(second_sketch, 'second-sketch');
*/

/*
function keyPressed() {
  if (keyCode == UP_ARROW && !stop) {
    var force = createVector(0, -9);
    bird.applyForce(force);
    bird.update();
  }
}
*/