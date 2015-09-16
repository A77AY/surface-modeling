var Point = (function () {
    function Point(x, y //,
        ) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();
var Triangle = (function () {
    function Triangle(p0, p1, p2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
    }
    Triangle.prototype.normal = function (vectorA, vectroB) {
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
    function Canvas(canvas, rotationXSlider, rotationYSlider, rotationZSlider, horizontalMaxSlider, verticalMaxSlider, horizontalPartitionsSlider, verticalPartitionsSlider) {
        this.canvas = canvas;
        this.rotationXSlider = rotationXSlider;
        this.rotationYSlider = rotationYSlider;
        this.rotationZSlider = rotationZSlider;
        this.horizontalMaxSlider = horizontalMaxSlider;
        this.verticalMaxSlider = verticalMaxSlider;
        this.horizontalPartitionsSlider = horizontalPartitionsSlider;
        this.verticalPartitionsSlider = verticalPartitionsSlider;
        this.init();
        this.draw();
    }
    Canvas.prototype.init = function () {
        this.context = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
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
        this.verticalMaxUpdate();
        this.horizontalMaxUpdate();
        this.verticalPartitionsUpdate();
        this.horizontalPartitionsUpdate();
    };
    Canvas.prototype.projection = function (x, y, z) {
        var projection = Matrix.Multiply(Matrix.Multiply(new Matrix([[x, y, z, 1]]), this.affine), this.t);
        return new Point(projection.matrix[0][0], projection.matrix[0][1]);
    };
    Canvas.prototype.rotationXUpdate = function () {
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
        var tmpRotation = this.rotationY;
        this.rotationY = Number(this.rotationYSlider.value);
        var angle = tmpRotation - this.rotationX;
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
        var tmpRotation = this.rotationZ;
        this.rotationZ = Number(this.rotationZSlider.value);
        var angle = tmpRotation - this.rotationX;
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
        this.horizontalMax = Number(this.horizontalMaxSlider.value);
        this.draw();
    };
    Canvas.prototype.verticalMaxUpdate = function () {
        this.verticalMax = Number(this.verticalMaxSlider.value);
        this.draw();
    };
    Canvas.prototype.horizontalPartitionsUpdate = function () {
        this.horizontalPartitions = Number(this.horizontalPartitionsSlider.value);
        this.draw();
    };
    Canvas.prototype.verticalPartitionsUpdate = function () {
        this.verticalPartitions = Number(this.verticalPartitionsSlider.value);
        this.draw();
    };
    Canvas.prototype.draw = function () {
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.lineWidth = 1;
        var m = new Array();
        var a = 200;
        var b = 100;
        var horizontalStep = this.horizontalMax / this.horizontalPartitions;
        var verticalStep = this.verticalMax / this.verticalPartitions;
        for (var i = 0; i <= this.horizontalPartitions; ++i) {
            m[i] = new Array();
            for (var j = 0; j <= this.verticalPartitions; ++j) {
                m[i][j] = this.projection(this.calculationX(horizontalStep * i, verticalStep * j - Math.PI, [a, b]), this.calculationY(horizontalStep * i, verticalStep * j - Math.PI, [a, b]), this.calculationZ(horizontalStep * i, verticalStep * j - Math.PI, [a, b]));
            }
        }
        for (var i = 0; i < m.length - 1; ++i) {
            for (var j = 0; j < m[0].length - 1; ++j) {
                this.drawTriangle(m[i][j], m[i + 1][j], m[i + 1][j + 1]);
                this.drawTriangle(m[i][j], m[i][j + 1], m[i + 1][j + 1]);
            }
        }
    };
    Canvas.prototype.calculationX = function (u, v, params) {
        return (params[0] + params[1] * Math.cos(u)) * Math.cos(v);
    };
    Canvas.prototype.calculationY = function (u, v, params) {
        return (params[0] + params[1] * Math.cos(u)) * Math.sin(v);
    };
    Canvas.prototype.calculationZ = function (u, v, params) {
        return params[1] * Math.sin(u);
    };
    Canvas.prototype.drawLine = function (start, end) {
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
    };
    Canvas.prototype.drawTriangle = function (start, middle, end) {
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(middle.x, middle.y);
        this.context.lineTo(end.x, end.y);
        this.context.closePath();
        this.context.stroke();
    };
    return Canvas;
})();
var canvas = new Canvas(document.getElementById("canvas"), document.getElementById("rotationX"), document.getElementById("rotationY"), document.getElementById("rotationZ"), document.getElementById("horizontalMax"), document.getElementById("verticalMax"), document.getElementById("horizontalPartitions"), document.getElementById("verticalPartitions"));
//# sourceMappingURL=main.js.map