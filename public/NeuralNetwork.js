class Network {
    arch = [];

    biases = [];
    weights = [];

    lr = 0;

    results = [];

    constructor(arch, lr = 0.01) {
        this.arch = arch;

        this.biases = this.getBiases(arch, 1);
        this.weights = this.getWeights(arch, 1);

        this.lr = lr;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    sigmoid_prime(x) {
        return x * (1 - x);
    }

    cost_prime(res, y) {
        return res - y;
    }

    argmax(arr) {
        var index = 0;
        var value = 0;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i] >= value) {
                index = i;
                value = arr[i];
            }
        }

        return index;
    }

    getBiases(arch, factor) {
        var arr = [];

        for (var i = 0; i < arch.length - 1; i++) {
            arr.push([]);

            for (var j = 0; j < arch[i + 1]; j++) {
                arr[i].push((Math.random() * 2 - 1) * factor);
            }
        }

        return arr;
    }

    getWeights(arch, factor) {
        var arr = [];

        for (var i = 0; i < arch.length - 1; i++) {
            arr.push([]);
            for (var j = 0; j < arch[i + 1]; j++) {
                arr[i].push([]);

                for (var k = 0; k < arch[i]; k++) {
                    arr[i][j].push((Math.random() * 2 - 1) * factor);
                }
            }
        }

        return arr;
    }

    feedforward(ip) {
        this.results = [ip];

        for (var layer = 0; layer < this.arch.length - 1; layer++) {
            var layerResult = [];

            for (var neuron = 0; neuron < this.arch[layer + 1]; neuron++) {
                var neuronResult = this.biases[layer][neuron];

                for (var connection = 0; connection < this.arch[layer]; connection++) {
                    neuronResult += this.weights[layer][neuron][connection] * ip[connection];
                }

                neuronResult = this.sigmoid(neuronResult);

                layerResult.push(neuronResult);
            }

            ip = layerResult;
            this.results.push(layerResult);
        }

        return this.results[this.results.length - 1];
    }

    evaluate(iterations, selectedSet) {
        var rand = Math.floor(Math.random() * (this.data.r.length - iterations));

        var correct = 0;

        for (var i = 0; i < iterations; i++) {
            let x = this.data.d[i + rand];
            let y = this.data.r[i + rand];

            let res = this.feedforward(x);

            if (selectedSet == 2) {
                if (this.argmax(y) == this.argmax(res)) {
                    correct += 1;
                }
            } else if (selectedSet == 1) {
                if (res[0] > 0.5) {
                    if (y[0] == 1) {
                        correct++;
                    }
                } else {
                    if (y[0] == 0) {
                        correct++;
                    }
                }
            } else if (selectedSet == 0) {
                const r1 = (res[0] > 0.5) ? 1 : 0;
                const r2 = (res[1] > 0.5) ? 1 : 0;

                if (r1 == y[0] && r2 == y[1]) {
                    correct++;
                }
            }
        }

        console.log("accuracy:", correct / iterations);

        return correct / iterations;
    }

    backpropagation(iterations, selectedSet) {
        var rand = Math.floor(Math.random() * (this.data.r.length - iterations));

        var weightChange = this.getWeights(this.arch, 0);
        var biasChange = this.getBiases(this.arch, 0);

        for (var i = 0; i < iterations; i++) {
            var x = this.data.d[i + rand];
            var y = this.data.r[i + rand];

            var previousDerivative = [];

            let res = this.feedforward(x);

            for (var j = 0; j < this.arch[this.arch.length - 1]; j++) {
                previousDerivative.push(this.cost_prime(res[j], y[j]));
            }

            for (var layer = this.arch.length - 1; layer > 0; layer--) {
                var layerDerivative = [];

                for (var j = 0; j < this.arch[layer - 1]; j++) {
                    layerDerivative.push(0);
                }

                for (var neuron = 0; neuron < this.arch[layer]; neuron++) {
                    var neuronDerivative = previousDerivative[neuron] * this.sigmoid_prime(this.results[layer][neuron]);

                    biasChange[layer - 1][neuron] += neuronDerivative;

                    for (var connection = 0; connection < this.arch[layer - 1]; connection++) {
                        layerDerivative[connection] += neuronDerivative * this.weights[layer - 1][neuron][connection];

                        weightChange[layer - 1][neuron][connection] += neuronDerivative * this.results[layer - 1][connection];
                    }
                }

                previousDerivative = layerDerivative;
            }
        }

        this.improve(biasChange, weightChange, iterations);
    }

    improve(biasChange, weightChange, iterations) {
        for (var layer = 0; layer < this.arch.length; layer++) {
            for (var neuron = 0; neuron < this.arch[layer + 1]; neuron++) {
                this.biases[layer][neuron] -= biasChange[layer][neuron] * this.lr / iterations;

                for (var connection = 0; connection < this.arch[layer]; connection++) {
                    this.weights[layer][neuron][connection] -= weightChange[layer][neuron][connection] * this.lr / iterations;
                }
            }
        }
    }
}
