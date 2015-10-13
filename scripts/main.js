var canvasEl = document.getElementById("canvas");
window.onload = function (e) {
    canvasResize();
};
window.onresize = function (e) {
    canvasResize();
};
function canvasResize() {
    canvasEl.width = document.body.clientWidth / 2;
    canvasEl.height = document.body.clientHeight;
    canvas.sizeUpdate();
}
var Point = (function () {
    function Point(x, y, z, matrix) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.x2D = 0;
        this.y2D = 0;
        this.z2D = 0;
        if (matrix) {
            this.projection(matrix);
        }
    }
    Point.prototype.projection = function (matrix) {
        var projection = Matrix.Multiply(new Matrix([[this.x, this.y, this.z, 1]]), matrix);
        this.x2D = projection.matrix[0][0];
        this.y2D = projection.matrix[0][1];
        this.z2D = projection.matrix[0][2];
    };
    Point.Minus = function (pointA, pointB) {
        return new Point(pointB.x2D - pointA.x2D, pointB.y2D - pointA.y2D, pointB.z2D - pointA.z2D);
    };
    return Point;
})();
var Triangle = (function () {
    function Triangle(p0, p1, p2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.setColor();
    }
    Triangle.prototype.setColor = function () {
        this.color = this.vectorColor(Point.Minus(this.p2, this.p0), Point.Minus(this.p1, this.p0));
    };
    Triangle.prototype.vectorColor = function (v0, v1) {
        var normal = new Point(v0.y * v1.z - v0.z * v1.y, v0.z * v1.x - v0.x * v1.z, v0.x * v1.y - v0.y * v1.x);
        return -normal.z / (Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2)));
    };
    return Triangle;
})();
var Matrix = (function () {
    function Matrix(param0, param1) {
        if (typeof (param0) === "number") {
            this.initEmpty(param0, param1);
        }
        else {
            this.matrix = param0;
            this.rows = this.matrix.length;
            this.columns = this.matrix[0].length;
        }
    }
    Matrix.prototype.initEmpty = function (rows, columns) {
        this.matrix = new Array();
        this.rows = rows;
        this.columns = columns;
        for (var i = 0; i < this.rows; ++i) {
            this.matrix[i] = new Array();
            for (var j = 0; j < this.columns; ++j) {
                this.matrix[i][j] = 0;
            }
        }
    };
    Matrix.Multiply = function (matrixA, matrixB) {
        var matrix = new Matrix(matrixA.rows, matrixB.columns);
        for (var i = 0; i < matrix.rows; ++i) {
            for (var j = 0; j < matrix.columns; ++j) {
                for (var k = 0; k < matrixA.columns; ++k) {
                    matrix.matrix[i][j] += matrixA.matrix[i][k] * matrixB.matrix[k][j];
                }
            }
        }
        return matrix;
    };
    return Matrix;
})();
var Canvas = (function () {
    function Canvas(canvas, rotationXSlider, rotationYSlider, rotationZSlider, horizontalMaxSlider, verticalMaxSlider, horizontalPartitionsSlider, verticalPartitionsSlider, rotationXSliderValue, rotationYSliderValue, rotationZSliderValue, horizontalMaxSliderValue, verticalMaxSliderValue, horizontalPartitionsSliderValue, verticalPartitionsSliderValue, aSlider, bSlider) {
        this.canvas = canvas;
        this.rotationXSlider = rotationXSlider;
        this.rotationYSlider = rotationYSlider;
        this.rotationZSlider = rotationZSlider;
        this.horizontalMaxSlider = horizontalMaxSlider;
        this.verticalMaxSlider = verticalMaxSlider;
        this.horizontalPartitionsSlider = horizontalPartitionsSlider;
        this.verticalPartitionsSlider = verticalPartitionsSlider;
        this.rotationXSliderValue = rotationXSliderValue;
        this.rotationYSliderValue = rotationYSliderValue;
        this.rotationZSliderValue = rotationZSliderValue;
        this.horizontalMaxSliderValue = horizontalMaxSliderValue;
        this.verticalMaxSliderValue = verticalMaxSliderValue;
        this.horizontalPartitionsSliderValue = horizontalPartitionsSliderValue;
        this.verticalPartitionsSliderValue = verticalPartitionsSliderValue;
        this.aSlider = aSlider;
        this.bSlider = bSlider;
        this.isFill = true;
        this.insideColorR = 0;
        this.insideColorG = 255;
        this.insideColorB = 0;
        this.colorR = 255;
        this.colorG = 0;
        this.colorB = 0;
        this.init();
        this.draw();
    }
    Canvas.prototype.init = function () {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context = this.canvas.getContext('2d');
        this.affine = new Matrix([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
        this.t = new Matrix([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [this.width / 2, this.height / 2, 0, 1]
        ]);
        this.rotationX = Number(this.rotationXSlider.value);
        this.rotationY = Number(this.rotationYSlider.value);
        this.rotationZ = Number(this.rotationZSlider.value);
        this.rotationXUpdate();
        this.rotationYUpdate();
        this.rotationZUpdate();
        this.verticalMaxUpdate();
        this.horizontalMaxUpdate();
        this.verticalPartitionsUpdate();
        this.horizontalPartitionsUpdate();
    };
    Canvas.prototype.sizeUpdate = function () {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.t = new Matrix([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [this.width / 2, this.height / 2, 0, 1]
        ]);
        this.draw();
    };
    Canvas.prototype.fillUpdate = function (value) {
        this.isFill = value;
        this.draw();
    };
    Canvas.prototype.aUpdate = function () {
    };
    Canvas.prototype.bUpdate = function () {
    };
    Canvas.prototype.rotationXUpdate = function () {
        this.rotationXSliderValue.innerHTML = this.rotationXSlider.value;
        var tmpRotation = this.rotationX;
        this.rotationX = Number(this.rotationXSlider.value);
        var angle = tmpRotation - this.rotationX;
        var rXSinAngle = Math.sin(angle);
        var rXCosAngle = Math.cos(angle);
        this.affine = Matrix.Multiply(this.affine, new Matrix([
            [1, 0, 0, 0],
            [0, rXCosAngle, rXSinAngle, 0],
            [0, -rXSinAngle, rXCosAngle, 0],
            [0, 0, 0, 1]]));
        this.draw();
    };
    Canvas.prototype.rotationYUpdate = function () {
        this.rotationYSliderValue.innerHTML = this.rotationYSlider.value;
        var tmpRotation = this.rotationY;
        this.rotationY = Number(this.rotationYSlider.value);
        var angle = tmpRotation - this.rotationY;
        var rYSinAngle = Math.sin(angle);
        var rYCosAngle = Math.cos(angle);
        this.affine = Matrix.Multiply(this.affine, new Matrix([
            [rYCosAngle, 0, -rYSinAngle, 0],
            [0, 1, 0, 0],
            [rYSinAngle, 0, rYCosAngle, 0],
            [0, 0, 0, 1]]));
        this.draw();
    };
    Canvas.prototype.rotationZUpdate = function () {
        this.rotationZSliderValue.innerHTML = this.rotationZSlider.value;
        var tmpRotation = this.rotationZ;
        this.rotationZ = Number(this.rotationZSlider.value);
        var angle = tmpRotation - this.rotationZ;
        var rZSinAngle = Math.sin(angle);
        var rZCosAngle = Math.cos(angle);
        this.affine = Matrix.Multiply(this.affine, new Matrix([
            [rZCosAngle, rZSinAngle, 0, 0],
            [-rZSinAngle, rZCosAngle, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]]));
        this.draw();
    };
    Canvas.prototype.horizontalMaxUpdate = function () {
        this.horizontalMaxSliderValue.innerHTML = this.horizontalMaxSlider.value;
        this.horizontalMax = Number(this.horizontalMaxSlider.value);
        this.draw();
    };
    Canvas.prototype.verticalMaxUpdate = function () {
        this.verticalMaxSliderValue.innerHTML = this.verticalMaxSlider.value;
        this.verticalMax = Number(this.verticalMaxSlider.value);
        this.draw();
    };
    Canvas.prototype.horizontalPartitionsUpdate = function () {
        this.horizontalPartitionsSliderValue.innerHTML = this.horizontalPartitionsSlider.value;
        this.horizontalPartitions = Number(this.horizontalPartitionsSlider.value);
        this.draw();
    };
    Canvas.prototype.verticalPartitionsUpdate = function () {
        this.verticalPartitionsSliderValue.innerHTML = this.verticalPartitionsSlider.value;
        this.verticalPartitions = Number(this.verticalPartitionsSlider.value);
        this.draw();
    };
    Canvas.prototype.draw = function () {
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.lineWidth = 1;
        var a = 200;
        var b = 100;
        var horizontalStep = this.horizontalMax / this.horizontalPartitions;
        var verticalStep = this.verticalMax / this.verticalPartitions;
        var matrix = Matrix.Multiply(this.affine, this.t);
        var points = new Array();
        var triangles = new Array();
        for (var i = 0; i <= this.horizontalPartitions; ++i) {
            points[i] = new Array();
            for (var j = 0; j <= this.verticalPartitions; ++j) {
                points[i][j] = new Point(this.calculationX(horizontalStep * i, verticalStep * j, [a, b]), this.calculationY(horizontalStep * i, verticalStep * j, [a, b]), this.calculationZ(horizontalStep * i, verticalStep * j, [a, b]), matrix);
            }
        }
        for (var i = 0; i < points.length - 1; ++i) {
            for (var j = 0; j < points[0].length - 1; ++j) {
                var triangle = new Triangle(points[i][j], points[i + 1][j + 1], points[i + 1][j]);
                var triangle2 = new Triangle(points[i + 1][j + 1], points[i][j], points[i][j + 1]);
                triangles.push(triangle);
                triangles.push(triangle2);
            }
        }
        for (var i = 0; i < triangles.length; ++i) {
            if (triangles[i].color < 0) {
                this.drawTriangle(triangles[i]);
            }
        }
        for (var i = 0; i < triangles.length; ++i) {
            if (triangles[i].color >= 0) {
                this.drawTriangle(triangles[i]);
            }
        }
    };
    Canvas.prototype.calculationX = function (u, v, params) {
        return (params[0] + params[1] * Math.cos(u)) * Math.cos(v - Math.PI);
    };
    Canvas.prototype.calculationY = function (u, v, params) {
        return (params[0] + params[1] * Math.cos(u)) * Math.sin(v - Math.PI);
    };
    Canvas.prototype.calculationZ = function (u, v, params) {
        return params[1] * Math.sin(u) + params[1] * Math.cos(u);
    };
    Canvas.prototype.drawTriangle = function (triangle) {
        this.context.beginPath();
        this.context.moveTo(triangle.p0.x2D, triangle.p0.y2D);
        this.context.lineTo(triangle.p1.x2D, triangle.p1.y2D);
        this.context.lineTo(triangle.p2.x2D, triangle.p2.y2D);
        this.context.closePath();
        if (this.isFill) {
            if (triangle.color < 0) {
                var r = -Math.floor(this.insideColorR * triangle.color);
                var g = -Math.floor(this.insideColorG * triangle.color);
                var b = -Math.floor(this.insideColorB * triangle.color);
            }
            else {
                var r = Math.floor(this.colorR * triangle.color);
                var g = Math.floor(this.colorG * triangle.color);
                var b = Math.floor(this.colorB * triangle.color);
            }
            var color = "rgb(" + r + "," + g + "," + b + ")";
            this.context.fillStyle = this.context.strokeStyle = color;
            this.context.lineWidth = 0;
            this.context.fill();
        }
        this.context.stroke();
    };
    Canvas.prototype.setColor = function (color) {
        var colorRes;
        switch (color) {
            case 0:
                colorRes = document.getElementById('rValue').innerHTML = document.getElementById('r').value;
                this.colorR = colorRes;
                break;
            case 1:
                colorRes = document.getElementById('gValue').innerHTML = document.getElementById('g').value;
                this.colorG = colorRes;
                break;
            case 2:
                colorRes = document.getElementById('bValue').innerHTML = document.getElementById('b').value;
                this.colorB = colorRes;
                break;
        }
        document.getElementById('color').style.backgroundColor = "rgb(" + this.colorR + "," + this.colorG + "," + this.colorB + ")";
        this.draw();
    };
    Canvas.prototype.setInsideColor = function (color) {
        var colorRes;
        switch (color) {
            case 0:
                colorRes = document.getElementById('riValue').innerHTML = document.getElementById('ri').value;
                this.insideColorR = colorRes;
                break;
            case 1:
                colorRes = document.getElementById('giValue').innerHTML = document.getElementById('gi').value;
                this.insideColorG = colorRes;
                break;
            case 2:
                colorRes = document.getElementById('biValue').innerHTML = document.getElementById('bi').value;
                this.insideColorB = colorRes;
                break;
        }
        document.getElementById('colorInside').style.backgroundColor = "rgb(" + this.insideColorR + "," + this.insideColorG + "," + this.insideColorB + ")";
        this.draw();
    };
    return Canvas;
})();
var canvas = new Canvas(document.getElementById("canvas"), document.getElementById("rotationX"), document.getElementById("rotationY"), document.getElementById("rotationZ"), document.getElementById("horizontalMax"), document.getElementById("verticalMax"), document.getElementById("horizontalPartitions"), document.getElementById("verticalPartitions"), document.getElementById("rotationXValue"), document.getElementById("rotationYValue"), document.getElementById("rotationZValue"), document.getElementById("horizontalMaxValue"), document.getElementById("verticalMaxValue"), document.getElementById("horizontalPartitionsValue"), document.getElementById("verticalPartitionsValue"), document.getElementById("a"), document.getElementById("b"));
canvas.setColor(0);
canvas.setColor(1);
canvas.setColor(2);
canvas.setInsideColor(0);
canvas.setInsideColor(1);
canvas.setInsideColor(2);
//# sourceMappingURL=main.js.map