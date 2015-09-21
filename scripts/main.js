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
        var v0 = Point.Minus(this.p2, this.p0);
        var v1 = Point.Minus(this.p1, this.p0);
        var normal = new Point(v0.x * v1.z - v0.z * v1.y, v0.z * v1.x - v0.x * v1.z, v0.x * v1.y - v0.y * v1.x);
        var scalar = -normal.z;
        var ma = Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2));
        var cosa = scalar / ma;
        this.color = cosa;
        this.color = Math.floor(this.color * 255);
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
        for (var i = 0, k = 0; i < points.length - 1; ++i) {
            for (var j = 0; j < points[0].length - 1; ++j, ++k) {
                triangles[k] = new Triangle(points[i][j], points[i + 1][j], points[i + 1][j + 1]);
                this.drawTriangle(triangles[k]);
                ++k;
                triangles[k] = new Triangle(points[i][j], points[i + 1][j + 1], points[i][j + 1]);
                this.drawTriangle(triangles[k]);
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
        return params[1] * Math.sin(u);
    };
    Canvas.prototype.drawTriangle = function (triangle) {
        this.context.beginPath();
        this.context.moveTo(triangle.p0.x2D, triangle.p0.y2D);
        this.context.lineTo(triangle.p1.x2D, triangle.p1.y2D);
        this.context.lineTo(triangle.p2.x2D, triangle.p2.y2D);
        this.context.closePath();
        if (triangle.color < 0) {
            this.context.fillStyle = "rgb(255," + (-1 * triangle.color) + ",255)";
            this.context.strokeStyle = "rgb(255," + (-1 * triangle.color) + ",255)";
        }
        else {
            this.context.fillStyle = "rgb(" + triangle.color + ",255,255)";
            this.context.strokeStyle = "rgb(" + triangle.color + ",255,255)";
        }
        this.context.lineWidth = 0;
        this.context.fill();
        this.context.stroke();
    };
    return Canvas;
})();
var canvas = new Canvas(document.getElementById("canvas"), document.getElementById("rotationX"), document.getElementById("rotationY"), document.getElementById("rotationZ"), document.getElementById("horizontalMax"), document.getElementById("verticalMax"), document.getElementById("horizontalPartitions"), document.getElementById("verticalPartitions"));
//# sourceMappingURL=main.js.map