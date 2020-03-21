//放公用方法  继承，拓展，单例
console.log("base");
var tool = {
    //继承原型方法  圣杯模式
    inherit: function (target, origin) {
        var F = function () { };
        F.prototype = origin.prototype;
        target.prototype = new F();
        target.prototype.contructor = target;
    },
    // 类似继承，可传参数
    //使用方法 
    /* var Food=tool.extends(Square);
    var f=new Food(10,10,100,200);
    var f1=new Food(10,10,100,200);
    f.collide();
    console.log(f.x,f.y,f.width,f.height); */
    extends: function (origin) {
        var target = function (){
            origin.apply(this, arguments);
            return this;
        };
        this.inherit(target, origin);
        return target;
    },
    single: function (origin) {
        var SingleResult = (function (){
            var instance;
            return function (){
                if(typeof instance == 'object'){
                    //说明不是第一次调用了
                    return instance;
                }
                origin && origin.apply(this, arguments);
                instance = this;
            }
        })();
        origin && this.inherit(SingleResult, origin);
        return SingleResult;
    }
}
/*
    这个文件里存放一些全局性的东西
        1、常用的一些变量
        2、创建一个最基础的方块构造函数
        3、根据方块的构造函数，创建游戏里各个元素对象
        4、
 */
// 场景位置
var positionX = 450;
var positionY = 100;

// 游戏区域大小
var td = 30;
var tr = 30;    //高度，列数（单位一个格子）

// 格子大小
var squareWidth = 20;

//蛇移动的时间间隔
var intervalTime = 100; 

// 基础方块的构造函数
function Square(x, y, width, height, dom){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.viewContent = dom || document.createElement('div');
}
Square.prototype.upDate = function (x,y){
    this.x = x;
    this.y = y;
    this.viewContent.style.left = squareWidth * x + 'px';
    this.viewContent.style.top = squareWidth * y + 'px';
}
// 游戏里其他元素的构造函数
var Ground = tool.single(Square);
var Floor = tool.extends(Square);
var Wall = tool.extends(Square);
var SnakeBody = tool.extends(Square);
var SnakeHead = tool.single(Square);
var Snake = tool.single();
var Game = tool.single();
var Food = tool.single(Square);

var collideType = {
    die : 'die',
    move : 'move',
    eat : 'eat'
}

// 创建管理者（构造函数）
function SquareFactory(){

}

// 用来初始化小方块
SquareFactory.prototype.init = function (square, color, action){
    square.viewContent.style.position = 'absolute';
    square.viewContent.style.backgroundColor = color;
    square.viewContent.style.width = square.width + 'px';
    square.viewContent.style.height = square.height + 'px';
    // x代表列，y代表行
    square.viewContent.style.top = square.height * square.y + 'px';
    square.viewContent.style.left = square.width * square.x + 'px';
    // 用来标明方块的类型
    square.collide=action;
}
// 包装创建方块的构造函数
SquareFactory.prototype.Floor = function (x, y, color){
    var floor = new Floor(x,y,squareWidth,squareWidth);
    this.init(floor, color,collideType.move);
    return floor;
}
SquareFactory.prototype.Wall = function (x, y, color){
    var wall = new Wall(x,y,squareWidth,squareWidth);
    this.init(wall, color, collideType.die);
    return wall;
}

// 创建蛇身的构造函数
SquareFactory.prototype.SnakeBody = function (x, y, color){
    var snakeBody = new SnakeBody(x,y,squareWidth,squareWidth);
    this.init(snakeBody, color, collideType.die);
    return snakeBody;
}
// 创建蛇头的构造函数
SquareFactory.prototype.SnakeHead = function (x, y, color){
    var snakeHead = new SnakeHead(x,y,squareWidth,squareWidth);
    this.init(snakeHead, color, collideType.die);
    snakeHead.upDate(x,y);
    return snakeHead;
}
SquareFactory.prototype.Food = function (x, y, color){
    var food = new Food(x,y,squareWidth,squareWidth);
    this.init(food, color, collideType.eat);
    food.upDate(x,y);
    return food;
}
// 提供一个对外创建方法的接口
SquareFactory.create = function (type, x, y, color){
    if(SquareFactory.prototype[type] == 'undefined'){
        throw 'no this func';
    }
    SquareFactory.prototype[type].prototype = new SquareFactory();
    return new SquareFactory.prototype[type](x,y,color);
}


var ground = new Ground(positionX, positionY, td * squareWidth, tr * squareWidth);
ground.init = function (){
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.viewContent.style.width = this.width + 'px';
    this.viewContent.style.height = this.height + 'px';
    this.viewContent.style.backgroundColor = 'pink';
    document.body.appendChild(this.viewContent);

    this.squareTable = [
        []
    ];
    // y代表y轴，行
    for(var y = 0; y < tr; y++){
        this.squareTable[y] = new Array(td);
        for(var x = 0; x < td; x++){
            if(x == 0 || x == td - 1 || y == 0 || y== tr - 1){
                var newSquare = SquareFactory.create('Wall', x, y, 'black');
            }
            else{
                var newSquare = SquareFactory.create('Floor', x, y, 'grey');
            }
            // console.log(newSquare);
            this.squareTable[y][x] = newSquare;
            this.viewContent.appendChild(newSquare.viewContent);
        }
    }
}
ground.remove = function (x,y){
    var curSquare = this.squareTable[y][x];
    // console.log(x,y,curSquare);
    // DOM中删除
    this.viewContent.removeChild(curSquare.viewContent);
    // 在数据中删除
    this.squareTable[y][x]=  null;
}
ground.append = function (square){
    this.viewContent.appendChild(square.viewContent);
    this.squareTable[square.y][square.x] = square;
}


var snake = new Snake();
snake.head = null;
snake.tail = null;

const directionNum = {
    left: {
        x : -1,
        y : 0
    },
    top: {
        x : 0,
        y : -1
    },
    right: {
        x : 1,
        y : 0
    },
    bottom: {
        x : 0,
        y : 1
    }
}

// 初始化
snake.init = function () {
    var snakeHead = SquareFactory.create('SnakeHead', 3, 1, 'pink');
    var snakeBody1 = SquareFactory.create('SnakeBody', 2, 1, 'green');
    var snakeBody2 = SquareFactory.create('SnakeBody', 1, 1, 'green');
    snake.head = snakeHead;
    snake.tail = snakeBody2;
    // 创建一个就想移出该地方的格子
    ground.remove(snakeHead.x, snakeHead.y);
    ground.append(snakeHead);   //再添加蛇头（一个位置只能有一个方块）

    ground.remove(snakeBody1.x, snakeBody1.y);   //先删除蛇身位置的地板方块
    ground.append(snakeBody1);  //再添加蛇身（一个位置只能有一个方块）

    ground.remove(snakeBody2.x, snakeBody2.y);   //先删除蛇身位置的地板方块
    ground.append(snakeBody2);  //再添加蛇身（一个位置只能有一个方块）

    // 链表
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;
    this.direction  = directionNum.right;  //给个默认方向
}
snake.getCollideSquare = function (){
    const nextSquare = ground.squareTable[snake.head.y + this.direction.y][snake.head.x + this.direction.x];
    this.collideMethod[nextSquare.collide](nextSquare);

}


snake.collideMethod = {
    move(square, boolean){
        // 创建一个新身体
        const newBody = SquareFactory.create('SnakeBody', snake.head.x, snake.head.y, 'green');
        // 处理链表关系
        newBody.next = snake.head.next;
        newBody.last = null;
        newBody.next.last = newBody;
        // 处理dom
        // console.log(snake.head.x,snake.head.y);
        ground.remove(snake.head.x, snake.head.y);
        ground.append(newBody);

        // 创建新蛇头
        var newHead = SquareFactory.create('SnakeHead', square.x, square.y, 'pink');
        // 处理链表关系
        newHead.last = null;
        newHead.next = newBody;
        newBody.last = newHead;
        // 处理dom
        ground.remove(square.x, square.y);
        ground.append(newHead);
        snake.head = newHead;
        // bool判断是否删除最后一截身体（若是吃食物则不用删除）
        if(!boolean){  //删除
            const newFloor = SquareFactory.create('Floor', snake.tail.x, snake.tail.y, 'grey');
            ground.remove(snake.tail.x, snake.tail.y);
            ground.append(newFloor);
            snake.tail = snake.tail.last;

        }
    },
    die (){
        game.over();
    },
    eat (square){
        this.move(square, true);
        game.score++;
        createFood();
    }
}

// snake.getCollideSquare();   


const game = new Game();
game.timer = null;
game.score = 0;
game.init = function (){
    ground.init();
    snake.init();   
    createFood();
    document.onkeydown = function (e){
        if(e.which == 37 && snake.direction != directionNum.right){
            snake.direction = directionNum.left;
        }else if(e.which == 38 && snake.direction != directionNum.bottom){
            snake.direction = directionNum.top;
        }else if(e.which == 39 && snake.direction != directionNum.left){
            snake.direction = directionNum.right ;
        }else if(e.which == 40 && snake.direction != directionNum.top){
            snake.direction = directionNum.bottom;
        }
    }
    const btn = document.getElementsByTagName('button')[0];
    btn.onclick = function (){
        game.start();
    }
}
game.start = function(){
    this.timer = setInterval(function (){
        snake.getCollideSquare();
    }, intervalTime);
}
game.over = function (){
    clearInterval(this.timer);
    alert("分数:" + this.score);
    // location.reload();
}

function createFood(){
    let x = null;
    let y = null;

    var flag = true;
    while(flag){
        x = Math.round(Math.random() * (td - 3) + 1);
        y = Math.round(Math.random() * (tr - 3) + 1);
        var ok = true;
        for(var node = snake.head;node;node = node.next ){
            if(x == node.x && y==node.y){
                ok = false;
                break;
            }
        }
        if(ok){
            flag = false;
        }
    }
    var food = SquareFactory.create('Food', x, y, 'red');
    console.log(x, y);
    ground.remove(x, y);
    ground.append(food);
}


game.init();