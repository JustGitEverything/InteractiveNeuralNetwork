function bucket(index, size) {
    var arr = [];

    for (var i = 0; i < size; i++) {
        arr.push(0);
    }

    arr[index] = 1;

    return arr;
}

function decompress(json) {
    data = json.d;

    for (var i = 0; i < data.length; i++) {
        date = [];

        for (var e = 0; e < data[i].length; e++) {
            if (data[i][e] < 0) {
                for (var j = 0; j < Math.abs(data[i][e]); j++) {
                    date.push(0);
                }
            } else {
                date.push(data[i][e]);
            }
        }

        data[i] = date;
    }

    res = json.r;

    for (var i = 0; i < res.length; i++) {
        res[i] = bucket(res[i], 10);
    }

    return json;
}

function drawNeurons(n) {
    $(".wrapper").empty();

    for (var layer = 0; layer < n.arch.length; layer++) {
        $(".wrapper").append('<div class="layer-div ' + layer + '"></div>');
        $("#network").height($(window).height() * 0.5 + "px");

        if ($(window).width() > 800) {
            $("#network").height($(window).height() * 0.6 + "px");
        }

        $(".layer-div").width(100 / n.arch.length + "%");

        neuronSize = $("#network").height() / n.arch[layer] * 0.6;

        if (n.arch[layer] < 4) {
            neuronSize = $("#network").height() / 3 * 0.7;
        }

        for (var neuron = 0; neuron < n.arch[layer]; neuron++) {
            $("." + layer).append('<div class="nw l' + layer + " n" + neuron + '"><div class="neuron"></div></div>');

            if (layer != 0) {
                $(".nw.l" + layer + ".n" + neuron + " > .neuron").css("background-color", "rgb(" + 100 + "," + 100 + "," + n.sigmoid(n.biases[layer - 1][neuron]) * 255 + ")");

                $(".nw.l" + layer + ".n" + neuron + " > .neuron").click((event) => {
                    var parent = "." + $(event.target).parent().attr("class").replaceAll(" ", ".");

                    if ($(parent + " > .neuron").css("background-color") == selectionColour) {
                        draw(n);
                    } else {
                        draw(n);
                        $(parent + " > .neuron").css("background-color", selectionColour);
                    }

                    const la = parent.charAt(parent.indexOf("l") + 1);
                    const ne = parent.charAt(parent.substring(3).indexOf("n") + 4);

                    $(".change-value").val(n.biases[la - 1][ne] * 100);
                    $(".currentValue").text(parseInt(n.biases[la - 1][ne] * 100) / 100);

                    addChangeListener(n);
                });
            }
        }

        $(".nw.l" + layer).height(neuronSize);
        $(".nw.l" + layer).width(neuronSize);
    }
}

function drawConnections(n) {
    for (var layer = 0; layer < n.arch.length; layer++) {
        for (var neuron = 0; neuron < n.arch[layer]; neuron++) {
            for (var connection = 0; connection < n.arch[layer - 1]; connection++) {
                const be = $(".nw.l" + (layer - 1) + ".n" + connection).position();
                const en = $(".nw.l" + layer + ".n" + neuron).position();

                const x1 = be.left + $("." + layer).width() / 2;
                const y1 = be.top + $("." + layer).height() / n.arch[layer - 1] / 2;
                const x2 = en.left + $("." + layer).width() / 2;
                const y2 = en.top + $("." + layer).height() / n.arch[layer] / 2;

                $(".nw.l" + layer + ".n" + neuron).append('<div class="connection l' + layer + " n" + neuron + " c" + connection + '"></div>');

                const a = (y1 - y2) / 2;
                const b = (x1 - x2) / 2;
                const length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

                $(".connection.l" + layer + ".n" + neuron + ".c" + connection).width(length + "px").css({ "transform": 'rotate(' + Math.atan(a / b) * 180 / Math.PI + 'deg)' }).css({ top: y1 - a, left: x1 - (length / 2 - Math.abs(b)) }).css("background-color", "rgb(" + 100 + "," + n.sigmoid(n.weights[layer - 1][neuron][connection]) * 255 + "," + 100 + ")");

                $(".connection.l" + layer + ".n" + neuron + ".c" + connection).click((event) => {
                    var c = "." + $(event.target).attr("class").replaceAll(" ", ".");

                    if ($(c + ".connection").css("background-color") == selectionColour) {
                        draw(n);
                    } else {
                        draw(n);
                        $(c + ".connection").css("background-color", selectionColour);
                    }

                    const la = c.charAt(c.indexOf("l") + 1);
                    const ne = c.charAt(c.substring(11).indexOf("n") + 12);
                    const co = c.charAt(c.substring(11).indexOf("c") + 12);

                    $(".change-value").val(n.weights[la - 1][ne][co] * 100);

                    $(".change-value").change(() => {
                        const obj = $('.connection').filter((index) => {
                            return $($('.connection')[index]).css("background-color") == selectionColour;
                        }).attr("class");

                        if (obj != undefined) {
                            const layer = obj.charAt(parseInt(obj.indexOf("l")) + 1);
                            const neuron = obj.charAt(parseInt(obj.substring(10).indexOf("n")) + 11);
                            const connection = obj.charAt(parseInt(obj.substring(7).indexOf("c")) + 8);

                            n.weights[layer - 1][neuron][connection] = parseInt($(".change-value").val()) / 100;

                            draw(n);
                        }

                        drawMandelbrot(n, mandelbrotParams)
                    });

                    $(".currentValue").text(parseInt(parseFloat($(".change-value").val())) / 100);
                });

                if (n.arch[layer] < 10 && n.arch[layer - 1] < 10) {
                    $(".connection.l" + layer + ".n" + neuron + ".c" + connection).height("3px");
                }
            }
        }
    }
}

function drawChanger(n) {
    $("#layer-changer").empty();

    for (var layer = 0; layer < n.arch.length; layer++) {
        $("#layer-changer").append('<div class="change-layer l' + layer + '"><input type="number" placeholder="num" class="change l' + layer + '"></div>');

        $(".change.l" + layer).val(n.arch[layer]);

        $(".change-layer.l" + layer).width(100 / n.arch.length + "%");

        $('.change.l' + layer).on('input', (event) => {
            if ($(event.target).val() != undefined) {
                n.arch[parseInt($(event.target).attr("class").slice(-1))] = parseInt($(event.target).val());

                redrawNetwork(n);
            }
        });

        $('.change.l' + layer).on('input', (event) => {
            if ($(event.target).val() == "0") {
                n.arch.splice(parseInt($(event.target).attr("class").slice(-1)), 1);

                redraw(n);
            }
        });
    }
}

function redrawNetwork(n) {
    n.weights = n.getWeights(n.arch, 1);
    n.biases = n.getBiases(n.arch, 1);
    drawNeurons(n);
    drawConnections(n);
}

function redraw(n) {
    redrawNetwork(n);
    drawChanger(n);
}

function draw(n) {
    drawNeurons(n);

    drawConnections(n);

    drawChanger(n);
}

function addChangeListener(n) {
    $(".change-value").off("change");

    $(".change-value").change(() => {
        const obj = $('.neuron').filter((index) => {
            return $($('.neuron')[index]).css("background-color") == selectionColour;
        }).parent().attr("class");

        if (obj != undefined) {
            const layer = obj.charAt(parseInt(obj.indexOf("l")) + 1);
            const neuron = obj.charAt(parseInt(obj.substring(1).indexOf("n")) + 2);

            n.biases[layer - 1][neuron] = parseInt($(".change-value").val()) / 100;

            draw(n);
        }

        drawMandelbrot(n, mandelbrotParams)
    });
}

function train(n, selectedSet, dot = 0, epochsLeft = parseInt($(".epochs").val()), i = parseInt($(".epochs").val())) {
    const animation = setInterval(() => {
        if (dot > 3) {
            dot = 0;

            $(".train-heading").text(epochsLeft + " epochs left, Training ");
        } else {
            var str = "";

            for (var i = 0; i < dot; i++) {
                str += ".";
            }

            $(".train-heading").text(epochsLeft + " epochs left, Training " + str);

            dot++;
        }
    }, 50)

    const interval = setInterval(() => {
        if (i != 0) {
            n.backpropagation(parseInt($(".iterations").val()), selectedSet);
            $(".eval-h").text("Evalue Neural Network, Accuracy: " + parseInt(n.evaluate(1000, selectedSet) * 100) / 100 + " %");
            i--;
            epochsLeft--;
            clearInterval(interval);
            clearInterval(animation);

            if (i % 20 == 0) {
                draw(n);

                if (selectedSet == 1) {
                    drawMandelbrot(n, mandelbrotParams);
                }
            }

            train(n, selectedSet, dot, epochsLeft, i);
        } else {
            clearInterval(interval);
            clearInterval(animation);
            $(".train-heading").text("Train Neural Network:");
        }
    }, 50);
}

function resetData(n) {
    n.data.d.push([]);

    for (var i = 0; i < 14 * 14; i++) {
        n.data.d[n.data.d.length - 1].push(0);
    }
}

function drawMnistInput(n) {
    var down = false;
    $(document).mousedown(function () {
        down = true;
    }).mouseup(function () {
        down = false;
    });

    $(".display").empty();
    $(".display").append('<h2 class="classify-digit">Classify digit:</h2><div class="classify-div"></div>');

    $(".classify-div").append('<div class="mnist-input"></div>');

    for (var row = 0; row < 14; row++) {
        $(".mnist-input").append('<div class="row r' + row + '"></div>');

        for (var i = 0; i < 14; i++) {
            $(".row.r" + row).append('<div class="pixel r' + row + " c" + i + '"></div>');

            $(".pixel.r" + row + ".c" + i).click((event) => {
                const classes = $(event.target).attr("class");
                const ri = classes.indexOf("r");
                const ci = classes.indexOf("c");

                r = classes.substring(ri + 1, ri + 3);
                c = classes.substring(ci + 1, ci + 3);

                n.data.d[n.data.d.length - 1][parseInt(c) + parseInt(r) * 14] = 1
                $(".pixel.r" + parseInt(r) + ".c" + parseInt(c)).css("background-color", "black");
            });

            $(".pixel.r" + row + ".c" + i).mouseover((event) => {
                if (down) {
                    const classes = $(event.target).attr("class");
                    const ri = classes.indexOf("r");
                    const ci = classes.indexOf("c");

                    r = classes.substring(ri + 1, ri + 3);
                    c = classes.substring(ci + 1, ci + 3);

                    n.data.d[n.data.d.length - 1][parseInt(c) + parseInt(r) * 14] = 1

                    $(".pixel.r" + parseInt(r) + ".c" + parseInt(c)).css("background-color", "black");
                }
            });
        }
    }

    $(".pixel").width(100 / 14 + "%");
    $(".pixel").height($(".pixel").width() + "px");

    $(".classify-div").append('<button class="clear-button">clear</button>');
    $(".classify-div").append('<button class="classify-button">classify</button>');

    $(".clear-button").click(() => {
        resetData(n);

        drawMnistInput(n);

        if ($(window).width() > 900) {
            $(".mnist-input").width("350px");
        } else {
            $(".mnist-input").height("40%");
        }

        $(".pixel").width(100 / 14 + "%");
        $(".pixel").height($(".pixel").width());
    });

    $(".classify-button").click(() => {
        const res = n.argmax(n.feedforward(n.data.d[n.data.d.length - 1]));

        $(".classify-digit").text("Classify digit: " + res);
    });
}

function isInside(r0, i0) {
    var r = 0;
    var c = 0;

    for (var i = 0; i < 1000; i++) {
        const rOld = r;
        r = Math.pow(r, 2) - Math.pow(c, 2) + r0;
        c = 2 * rOld * c + i0;

        if (Math.pow(r, 2) + Math.pow(c, 2) > 4) {
            return false;
        }
    }

    return true;
}

function drawMap(pixels) {
    $(".display").empty();
    $(".display").append('<h2 class="map-h">Network output:</h2><div class="map-div"></div>');

    for (var row = 0; row < pixels; row++) {
        $(".map-div").append('<div class="row r' + row + '"></div>');

        for (var i = 0; i < pixels; i++) {
            $(".row.r" + row).append('<div class="map-p r' + row + " c" + i + '"></div>');
        }
    }

    $(".map-p").width(100 / pixels + "%");
    $(".map-p").height($(".map-p").width() + "px");
}

function createMandelbrotData(n, mP) {
    n.data = { d: [], r: [] };

    const lengthReal = Math.abs(mP.mR) + Math.abs(mP.xR);

    const lengthImag = Math.abs(mP.mI) + Math.abs(mP.xI);

    for (var x = 0; x < mP.size; x++) {
        for (var y = 0; y < mP.size; y++) {
            const valX = x / mP.size * lengthReal + mP.mR;
            const valY = y / mP.size * lengthImag + mP.mI;

            n.data.d.push([valX, valY]);

            const inside = isInside(valX, valY);

            if (inside) {
                n.data.r.push([1]);
            } else {
                n.data.r.push([0]);
            }
        }
    }

    n.data = shuffle(n.data);
}

function drawMandelbrot(n, mP) {
    const lengthReal = Math.abs(mP.mR) + Math.abs(mP.xR);

    const lengthImag = Math.abs(mP.mI) + Math.abs(mP.xI);

    for (var x = 0; x < mP.size; x++) {
        for (var y = 0; y < mP.size; y++) {
            const valX = x / mP.size * lengthReal + mP.mR;
            const valY = y / mP.size * lengthImag + mP.mI;

            const inside = isInside(valX, valY);

            var r = 100;
            var g = 220;
            var b = 120;

            const op = n.feedforward([valX, valY]);

            b += op[0] * 135;

            if (inside) {
                r = 150;
                g += 20;
            }

            $(".map-p.r" + y + ".c" + x).css("background-color", 'rgb(' + r + ', ' + g + ', ' + b + ')');
        }
    }
}

function shuffle(data) {
    d = { d: [], r: [] };

    for (var i = 0; i < data.d.length; i++) {
        const rand = parseInt(Math.random() * d.d.length);

        d.d.splice(rand, 0, data.d[i]);
        d.r.splice(rand, 0, data.r[i]);
    }

    return d;
}

function setTrainButton(selectedSet) {
    $(".train-button").off("click");

    $(".train-button").click(() => {
        if ($(".epochs").val() != "" && $(".iterations").val() != "") {
            train(n, selectedSet);
        } else {
            alert("Please enter number of epochs and iterations for training");
        }
    });
}

function drawForestData(n, fP) {
    var data = { d: [], r: [] };

    var down = false;
    $(document).mousedown(function () {
        down = true;
    }).mouseup(function () {
        down = false;
    });

    const lengthA = Math.abs(fP.mA) + Math.abs(fP.xA);

    const lengthT = Math.abs(fP.mT) + Math.abs(fP.xT);

    for (var x = 0; x < fP.size; x++) {
        for (var y = 0; y < fP.size; y++) {
            const valX = x / fP.size * lengthA + fP.mA;
            const valY = y / fP.size * lengthT + fP.mT;

            var r = 100;
            var g = 100;
            var b = 120;

            const op = n.feedforward([valX, valY]);

            g += op[0] * 135;

            $(".map-p.r" + y + ".c" + x).css("background-color", 'rgb(' + r + ', ' + g + ', ' + b + ')');

            $(".map-p.r" + y + ".c" + x).mouseover((event) => {
                if (down) {
                    const classes = $(event.target).attr("class");
                    const ri = classes.indexOf("r");
                    const ci = classes.indexOf("c");

                    r = classes.substring(ri + 1, ri + 3);
                    c = classes.substring(ci + 1, ci + 3);

                    $(".map-p.r" + r + ".c" + c).css("background-color", "rgb(100, " + (255 * parseInt($(".epochs").val())) + ", " + (255 * parseInt($(".iterations").val())) + ")")

                    const vX = lengthA - r / fP.size * lengthA + fP.mA;
                    const vY = c / fP.size * lengthT + fP.mT;

                    data.d.push([vX, vY])
                    data.r.push([parseInt($(".epochs").val()), parseInt($(".iterations").val())])

                    console.log(data);
                }
            });
        }
    }
}


const mandelbrotParams = { size: 70, mR: -1.525, xR: 0.575, mI: -1.05, xI: 1.05 };
const forestParams = { size: 70, mA: 0.4, xA: 0.7, mT: -3.0, xT: 2.5 };

const selectionColour = "rgb(220, 50, 50)"

const n = new Network([2, 3, 2], 10);

const dataSets = ["forest", "mandelbrot", "mnist"];
var selectedSet = 0;

// Global variables


$(window).on('resize', () => {
    if ($(window).width() > 700) {
        $(".set img").width("170px");
    } else {
        $(".set img").width("80%");
    }

    if ($(window).width() > 900) {
        $(".mnist-input").width("350px");
        $(".map-div").width("350px");
    } else {
        $(".mnist-input").width("40%");
        $(".map-div").width("40%");
    }

    draw(n);

    $(".pixel").height($(".pixel").width() + "px");
    $(".map-p").height($(".map-p").width() + "px");
});

$(document).ready(() => {
    // Draw Data Sets

    if ($(window).width() > 700) {
        $(".set img").width("170px");
    } else {
        $(".set img").width("80%");
    }

    for (var i = 0; i < dataSets.length; i++) {
        if ($(window).width() > 700) {
            $(".set img").width("170px");
        }

        $(".set img." + dataSets[i]).click((event) => {
            if ($(event.target).attr("class") == dataSets[0]) {
                // $.getJSON("forest.json", (json) => {
                //     n.data = decompress(json);
                //     n.arch = [2, 2];
                //     redraw(n);
                // });
                n.arch = [2, 3, 2];
                redraw(n);

                drawMap(forestParams.size);
                drawForestData(n, forestParams);
            } else if ($(event.target).attr("class") == dataSets[1]) {
                drawMap(mandelbrotParams.size);

                n.arch = [2, 5, 1];
                redraw(n);
                createMandelbrotData(n, mandelbrotParams);
                drawMandelbrot(n, mandelbrotParams);

                selectedSet = 1;
            } else if ($(event.target).attr("class") == dataSets[2]) {
                $.getJSON("data.json", (json) => {
                    n.data = decompress(json);
                    n.arch = [14 * 14, 6, 10];
                    redraw(n);

                    resetData(n);
                });

                selectedSet = 2;

                drawMnistInput(n);
            }

            setTrainButton(selectedSet);
        });
    }

    // Network

    $(".add-button").click(() => {
        if ($(".add-input").val() != '') {
            n.arch.splice(n.arch.length - 1, 0, parseInt($(".add-input").val()));

            addChangeListener(n);

            redraw(n);
        } else {
            alert("Please enter a number before adding layer");
        }
    });

    $(".change-value").on("input", (event) => {
        $(".currentValue").text($(event.target).val() / 100);
    });

    $(".change-value").change(() => {
        drawMandelbrot(n, mandelbrotParams);
    });

    // train

    setTrainButton(selectedSet);

    $(".evaluate-button").click(() => {
        if ($(".evaluate.iterations").val() != "") {
            const accuracy = n.evaluate(parseInt($(".evaluate.iterations").val()), selectedSet);

            $(".eval-h").text("Evalue Neural Network, Accuracy: " + accuracy + " %");
        } else {
            alert("Please enter number of iterations for evaluation");
        }
    });

    // Change lr

    $(".lr-value").text(n.lr);
    $(".change-lr").val(Math.pow((n.lr), 1 / 3) * 20);

    $(".change-lr").on("input", (event) => {
        const val = Math.pow(($(event.target).val() / 20), 3);
        n.lr = val;
        if (val < 1) {
            $(".lr-value").text(parseInt((val) * 1000000) / 1000000);
        } else {
            $(".lr-value").text(parseInt((val) * 100) / 100);
        }
    });
});

// Page is ready

$(window).on("load", () => {
    draw(n);
});
