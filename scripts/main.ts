class Point {

    x2D: number = 0;
    y2D: number = 0;

    constructor(
        public x:number,
        public y:number,
        public z:number,
        matrix?: Matrix
    ) {
        if(matrix) {
            this.projection(matrix);
        }
    }

    projection(matrix: Matrix) {
        var projection: Matrix = Matrix.Multiply(new Matrix([[this.x, this.y, this.z, 1]]), matrix);
        this.x2D = projection.matrix[0][0];
        this.y2D = projection.matrix[0][1];
    }
}

class Triangle {
    constructor(
        public p0: Point,
        public p1: Point,
        public p2: Point
    ) {

    }

    normal(vectorA: Point, vectroB: Point) {

    }
}

class Matrix {

    rows: number;
    columns: number;
    matrix: Array<Array<number>>;

    constructor(rows: number, columns: number);
    constructor(matrix: Array<Array<number>>);
    constructor(param0: any, param1?: any) {
        if(typeof(param0) === "number"){
            this.initEmpty(param0, param1);
        }
        else {
            this.matrix = param0;
            this.rows = this.matrix.length;
            this.columns = this.matrix[0].length;
        }
    }

    initEmpty(rows: number, columns: number){
        this.matrix = new Array();
        this.rows = rows;
        this.columns = columns;
        for(var i=0; i<this.rows; ++i) {
            this.matrix[i] = new Array();
            for(var j=0; j<this.columns; ++j) {
                this.matrix[i][j] = 0;
            }
        }
    }

    static Multiply(matrixA: Matrix, matrixB: Matrix) {
        var matrix: Matrix = new Matrix(matrixA.rows, matrixB.columns);
        for(var i=0; i<matrix.rows; ++i) {
            for(var j=0; j<matrix.columns; ++j) {
                for(var k=0; k<matrixA.columns; ++k) {
                    matrix.matrix[i][j] += matrixA.matrix[i][k] * matrixB.matrix[k][j];
                }
            }
        }
        return matrix;
    }
}

class Canvas {

    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    horizontalMax: number;
    verticalMax: number;
    horizontalPartitions: number;
    verticalPartitions: number;
    affine: Matrix;
    t: Matrix;

    constructor(
        private canvas: HTMLCanvasElement,
        private rotationXSlider: HTMLInputElement,
        private rotationYSlider: HTMLInputElement,
        private rotationZSlider: HTMLInputElement,
        private horizontalMaxSlider: HTMLInputElement,
        private verticalMaxSlider: HTMLInputElement,
        private horizontalPartitionsSlider: HTMLInputElement,
        private verticalPartitionsSlider: HTMLInputElement
    ) {
        this.init();
        this.draw();
    }

    init() {
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
            [this.width/2, this.height/2, 0, 1]
        ]);
        this.rotationX = Number(this.rotationXSlider.value);
        this.rotationY = Number(this.rotationYSlider.value);
        this.rotationZ = Number(this.rotationZSlider.value);
        this.verticalMaxUpdate();
        this.horizontalMaxUpdate();
        this.verticalPartitionsUpdate();
        this.horizontalPartitionsUpdate();

    }

    rotationXUpdate() {
        var tmpRotation = this.rotationX;
        this.rotationX = Number(this.rotationXSlider.value);
        var angle = tmpRotation-this.rotationX;
        var rXSinAngle = Math.sin(angle);
        var rXCosAngle = Math.cos(angle);
        this.affine = Matrix.Multiply(this.affine,
            new Matrix([
                [1, 0, 0, 0],
                [0, rXCosAngle, rXSinAngle, 0],
                [0, -rXSinAngle, rXCosAngle, 0],
                [0, 0, 0, 1]]));
        this.draw();
    }

    rotationYUpdate() {
        var tmpRotation = this.rotationY;
        this.rotationY = Number(this.rotationYSlider.value);
        var angle = tmpRotation-this.rotationY;
        var rYSinAngle = Math.sin(angle);
        var rYCosAngle = Math.cos(angle);
        this.affine = Matrix.Multiply(this.affine,
            new Matrix([
                [rYCosAngle, 0, -rYSinAngle, 0],
                [0, 1, 0, 0],
                [rYSinAngle, 0, rYCosAngle, 0],
                [0, 0, 0, 1]]));
        this.draw();
    }

    rotationZUpdate() {
        var tmpRotation = this.rotationZ;
        this.rotationZ = Number(this.rotationZSlider.value);
        var angle = tmpRotation-this.rotationZ;
        var rZSinAngle = Math.sin(angle);
        var rZCosAngle = Math.cos(angle);
        this.affine = Matrix.Multiply(this.affine,
            new Matrix([
                [rZCosAngle, rZSinAngle, 0, 0],
                [-rZSinAngle, rZCosAngle, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]]));
        this.draw();
    }

    horizontalMaxUpdate() {
        this.horizontalMax = Number(this.horizontalMaxSlider.value);
        this.draw();
    }

    verticalMaxUpdate() {
        this.verticalMax = Number(this.verticalMaxSlider.value);
        this.draw();
    }
    horizontalPartitionsUpdate() {
        this.horizontalPartitions = Number(this.horizontalPartitionsSlider.value);
        this.draw();
    }
    verticalPartitionsUpdate() {
        this.verticalPartitions = Number(this.verticalPartitionsSlider.value);
        this.draw();
    }

    draw() {
        this.context.fillStyle = '#fff';
        this.context.fillRect(0,0,this.width,this.height);
        this.context.lineWidth = 1;

        var a = 200;
        var b = 100;

        var horizontalStep = this.horizontalMax/this.horizontalPartitions;
        var verticalStep = this.verticalMax/this.verticalPartitions;
        var matrix = Matrix.Multiply(this.affine, this.t);

        var points: Array<Array<Point>> = new Array();
        var triangles: Array<Triangle> = new Array();

        for(var i=0; i<=this.horizontalPartitions; ++i){
            points[i] = new Array();
            for(var j=0; j<=this.verticalPartitions; ++j){
                points[i][j] = new Point(
                    this.calculationX(horizontalStep*i,verticalStep*j,[a,b]),
                    this.calculationY(horizontalStep*i,verticalStep*j,[a,b]),
                    this.calculationZ(horizontalStep*i,verticalStep*j,[a,b]),
                    matrix
                );
            }
        }

        for(var i=0, k=0; i<points.length - 1; ++i) {
            for (var j = 0; j < points[0].length - 1; ++j, ++k) {
                triangles[k] = new Triangle(points[i][j], points[i+1][j], points[i+1][j+1]);
                this.drawTriangle(triangles[k]);
                ++k;
                triangles[k] = new Triangle(points[i][j], points[i][j+1], points[i+1][j+1]);
                this.drawTriangle(triangles[k]);
            }
        }

    }

    calculationX(u: number, v:number, params: Array<number>) {
        return (params[0]+params[1]*Math.cos(u))*Math.cos(v-Math.PI);
    }

    calculationY(u: number, v:number, params: Array<number>) {
        return (params[0]+params[1]*Math.cos(u))*Math.sin(v-Math.PI);
    }

    calculationZ(u: number, v:number, params: Array<number>) {
        return params[1]*Math.sin(u);
    }

    drawTriangle(triangle: Triangle) {
        this.context.beginPath();
        this.context.moveTo(triangle.p0.x2D,triangle.p0.y2D);
        this.context.lineTo(triangle.p1.x2D,triangle.p1.y2D);
        this.context.lineTo(triangle.p2.x2D,triangle.p2.y2D);
        this.context.closePath();
        this.context.stroke();
    }
}

var canvas: Canvas = new Canvas(
    <HTMLCanvasElement>document.getElementById("canvas"),
    <HTMLInputElement>document.getElementById("rotationX"),
    <HTMLInputElement>document.getElementById("rotationY"),
    <HTMLInputElement>document.getElementById("rotationZ"),
    <HTMLInputElement>document.getElementById("horizontalMax"),
    <HTMLInputElement>document.getElementById("verticalMax"),
    <HTMLInputElement>document.getElementById("horizontalPartitions"),
    <HTMLInputElement>document.getElementById("verticalPartitions")
);