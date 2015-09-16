class Point {
    constructor(
        public x:number,
        public y:number//,
        //public z:number
    ) {

    }


}

class Triangle {
    constructor(
        private p0: Point,
        private p1: Point,
        private p2: Point
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

    projection(x: number, y: number, z: number) {
        var projection: Matrix = Matrix.Multiply(Matrix.Multiply(new Matrix([[x, y, z, 1]]), this.affine),this.t);
        return new Point(projection.matrix[0][0],projection.matrix[0][1]);
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
        var angle = tmpRotation-this.rotationX;
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
        var angle = tmpRotation-this.rotationX;
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

        var m = new Array();
        var a = 200;
        var b = 100;

        var horizontalStep = this.horizontalMax/this.horizontalPartitions;
        var verticalStep = this.verticalMax/this.verticalPartitions;

        for(var i=0; i<=this.horizontalPartitions; ++i){
            m[i] = new Array();
            for(var j=0; j<=this.verticalPartitions; ++j){
                m[i][j] = this.projection(
                    this.calculationX(horizontalStep*i,verticalStep*j-Math.PI,[a,b]),
                    this.calculationY(horizontalStep*i,verticalStep*j-Math.PI,[a,b]),
                    this.calculationZ(horizontalStep*i,verticalStep*j-Math.PI,[a,b])
                );
            }
        }

        for(var i=0; i<m.length - 1; ++i) {
            for (var j = 0; j < m[0].length - 1; ++j) {
                this.drawTriangle(m[i][j], m[i+1][j], m[i+1][j+1]);
                this.drawTriangle(m[i][j], m[i][j+1], m[i+1][j+1]);
            }
        }

    }

    calculationX(u: number, v:number, params: Array<number>) {
        return (params[0]+params[1]*Math.cos(u))*Math.cos(v);
    }

    calculationY(u: number, v:number, params: Array<number>) {
        return (params[0]+params[1]*Math.cos(u))*Math.sin(v);
    }

    calculationZ(u: number, v:number, params: Array<number>) {
        return params[1]*Math.sin(u);
    }

    drawLine(start: Point, end: Point) {
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
    }

    drawTriangle(start: Point, middle: Point, end: Point) {
        this.context.beginPath();
        this.context.moveTo(start.x,start.y);
        this.context.lineTo(middle.x,middle.y);
        this.context.lineTo(end.x,end.y);
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