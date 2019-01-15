class NeuralNetwork {
  constructor(nb_inputs, nb_hidden, nb_outputs) {
    // nb_hidden should be an array of size nb_layers containing the number of neurons for its layer.
    this.nb_inputs = nb_inputs;
    this.nb_hidden = nb_hidden;
    this.nb_outputs = nb_outputs;

    this.weights = [];
    this.nb_h_weights = nb_hidden.length;
    var w;
    if (this.nb_h_weights == 1) { // One hidden layer connected to inputs and outputs.
      w = new Matrix(nb_hidden[0], nb_inputs); // weights_ih.
      this.weights.push(w);
      w = new Matrix(nb_outputs, nb_hidden[0]); // weights_ho.
      this.weights.push(w);
    } else if (this.nb_h_weights == 2) { // Two hidden layers connected to each other. The first is also connected to the inputs and the second to the outputs.
      w = new Matrix(nb_hidden[0], nb_inputs); // weights_ih1.
      this.weights.push(w);
      w = new Matrix(nb_hidden[1], nb_hidden[0]); // weights_h1h2.
      this.weights.push(w);
      w = new Matrix(nb_outputs, nb_hidden[1]); // weights_h2o;
      this.weights.push(w);
    } else { // Three or more.
      for (var i = 0; i < this.nb_h_weights; i++) {
        if (i === 0) { // First layer --> Connected to inputs.
          w = new Matrix(nb_hidden[i], nb_inputs); // Inputs.
          this.weights.push(w);
        } else if (i == this.nb_h_weights - 1) { // Last layer --> Connected to outputs and the one before it (in first).
          w = new Matrix(nb_hidden[i], nb_hidden[i - 1]);
          this.weights.push(w);
          w = new Matrix(nb_outputs, nb_hidden[i]); // Outputs.
          this.weights.push(w);
        } else { // In-between layer --> Connected to the one before it.
          w = new Matrix(nb_hidden[i], nb_hidden[i - 1]);
          this.weights.push(w);
        }
      }
    }

    this.bias = [];
    for (var i = 0; i < this.weights.length; i++) {
      this.weights[i].randomize(-1, 1);
      var b = new Matrix(this.weights[i].rows, 1);
      b.add(1);
      this.bias.push(b);
    }

    this.learningRate = 0.1;
  }

  feedForward(input_array) {
    var input_matrix = matrixFromArray(input_array);

    // Hidden layers calculation.
    var layers = [];
    var len = this.weights.length;
    for (var i = 0; i < len; i++) {
      if (i === 0) {
        // Calculating the first hidden.
        var l = this.weights[i].dotProduct(input_matrix);
        l.add(this.bias[i]);
        l.map(sigmoid);
        layers.push(l);
      } else if (i == len - 1) {
        // Calculating the outputs.
        var l = this.weights[i].dotProduct(layers[i - 1]); // Outputs;
        l.add(this.bias[i]);
        l.map(sigmoid);
        layers.push(l);
      } else {
        var l = this.weights[i].dotProduct(layers[i - 1]);
        l.add(this.bias[i]);
        l.map(sigmoid);
        layers.push(l);
      }
    }

    // Return result as an array.
    return matrixToArray(layers[layers.length - 1]);
  }

}

function sigmoid(x) {
  return 1 / (1 + Math.pow(Math.E, -x));
}

function d_sigmoid(x) {
  return x * (1 - x);
  //return sigmoid(x) * (1 - sigmoid(x));
}