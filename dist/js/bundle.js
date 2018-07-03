(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var player_1 = require("./player");
var wall_1 = require("./wall");
var world_1 = require("./world");
var vector2d_1 = require("./vector2d");
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.preTickTmstp = 0;
        this.tick = function () {
            var deltaTime = (Date.now() - _this.preTickTmstp) / 1000;
            _this.preTickTmstp = Date.now();
            _this.update(deltaTime);
            _this.render();
            requestAnimationFrame(_this.tick);
        };
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.world = new world_1.World(3, [
            new wall_1.Wall('black', new vector2d_1.Vector2D(300, 300), new vector2d_1.Vector2D(300, 10)),
            new wall_1.Wall('black', new vector2d_1.Vector2D(350, 250), new vector2d_1.Vector2D(50, 10)),
            new wall_1.Wall('black', new vector2d_1.Vector2D(400, 250), new vector2d_1.Vector2D(50, 10))
        ]);
        this.players = [];
        this.players.push(new player_1.Player(this.world, new vector2d_1.Vector2D(300, 200), "red", this.players));
        this.players.push(new player_1.Player(this.world, new vector2d_1.Vector2D(350, 200), "blue", this.players));
        this.preTickTmstp = Date.now();
        requestAnimationFrame(this.tick);
    }
    Game.prototype.update = function (deltaTime) {
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            player.update(deltaTime);
        }
    };
    Game.prototype.render = function () {
        this.clear();
        this.world.draw(this.ctx);
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            player.draw(this.ctx);
        }
    };
    Game.prototype.clear = function () {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return Game;
}());
exports.Game = Game;

},{"./player":3,"./vector2d":4,"./wall":5,"./world":6}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var game_1 = require("./game");
document.addEventListener("DOMContentLoaded", function () {
    var g = new game_1.Game();
});

},{"./game":1}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var vector2d_1 = require("./vector2d");
var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 0] = "UP";
    Direction[Direction["LEFT"] = 1] = "LEFT";
    Direction[Direction["DOWN"] = 2] = "DOWN";
    Direction[Direction["RIGHT"] = 3] = "RIGHT";
})(Direction || (Direction = {}));
var Action;
(function (Action) {
    Action[Action["JUMP"] = 0] = "JUMP";
    Action[Action["LEFT"] = 1] = "LEFT";
    Action[Action["DOWN"] = 2] = "DOWN";
    Action[Action["RIGHT"] = 3] = "RIGHT";
    Action[Action["ATTACK"] = 4] = "ATTACK";
    Action[Action["SHIELD"] = 5] = "SHIELD";
})(Action || (Action = {}));
var Player = /** @class */ (function () {
    function Player(world, pos, color, players) {
        //{action:bool}
        this.actions = {};
        //{key:action}
        this.mapping = {
            'w': 'jump',
            'a': 'left',
            's': 'down',
            'd': 'right',
            'f': 'attack',
            'r': 'shield'
        };
        this.color = "black";
        this.grounded = false;
        this.walled = false;
        this.shielded = false;
        this.attacking = false;
        this.canAttack = false;
        this.canJump = false;
        this.canShield = false;
        this.attackingTime = 0;
        this.remainingShield = 0;
        this.JUMP_SPEED = 3;
        this.MOVE_SPEED = 3;
        this.DRAG = 3;
        this.ATTACK_RANGE = 3;
        this.ATTACK_IMPULSE = 3;
        this.ATTACK_TIME = 3;
        this.SHIELD_TIME = 3;
        this.players = players;
        this.world = world;
        this.color = color;
        this.pos = pos;
        this.vel = new vector2d_1.Vector2D(0, 0);
        this.size = new vector2d_1.Vector2D(20, 20);
        this.initListeners();
    }
    Player.prototype.initListeners = function () {
        var _this = this;
        document.addEventListener('keydown', function (ev) {
            _this.actions[_this.mapping[ev.key]] = true;
        });
        document.addEventListener('keyup', function (ev) {
            _this.actions[_this.mapping[ev.key]] = false;
        });
    };
    Player.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2, this.size.x, this.size.y);
        if (this.shielded) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size.x + 5, 0, 2 * Math.PI);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#008510';
            ctx.stroke();
        }
        if (this.attacking) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size.x + 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#008510';
            ctx.fill();
        }
    };
    Player.prototype.update = function (deltaTime) {
        //Apply gravity
        this.vel.y += this.world.gravity * deltaTime;
        if (this.vel.x > 0)
            this.vel.x -= this.DRAG * deltaTime;
        else if (this.vel.x < 0)
            this.vel.x += this.DRAG * deltaTime;
        //Process input
        if (this.actions.left)
            this.vel.x = Math.max(-this.MOVE_SPEED, this.vel.x - this.MOVE_SPEED);
        if (this.actions.right)
            this.vel.x = Math.min(this.MOVE_SPEED, this.vel.x + this.MOVE_SPEED);
        if (this.actions.down)
            this.vel.y = Math.min(this.MOVE_SPEED, this.vel.y + this.MOVE_SPEED);
        if (this.actions.jump) {
            if (this.grounded) {
                this.vel.y = -this.JUMP_SPEED;
                this.actions.jump = false;
            }
            else if (this.canJump) {
                this.vel.y = -this.JUMP_SPEED;
                this.canJump = false;
            }
            else if (this.walled) {
                this.vel.y = -this.JUMP_SPEED;
                //Inverted speed direction
                if (this.actions.left)
                    this.vel.x = this.JUMP_SPEED;
                else if (this.actions.right)
                    this.vel.x = -this.JUMP_SPEED;
                this.actions.jump = false;
            }
        }
        if (this.actions.attack && !this.shielded && !this.grounded && !this.walled) {
            if (this.canAttack) {
                this.attacking = true;
                for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
                    var player = _a[_i];
                    if (player !== this && !player.shielded && this.atRange(player)) {
                        var impactVec = player.pos.copy();
                        impactVec.substract(this.pos);
                        impactVec.mul(this.ATTACK_IMPULSE);
                        player.vel.set(impactVec.x, impactVec.y);
                    }
                }
                this.canAttack = false;
            }
        }
        if (this.actions.shield && !this.attacking && !this.grounded && !this.walled) {
            if (this.canShield) {
                this.shielded = true;
                this.canShield = false;
            }
        }
        if (this.attacking) {
            this.attackingTime -= deltaTime;
            if (this.attackingTime < 0)
                this.attacking = false;
        }
        if (this.shielded) {
            this.remainingShield -= deltaTime;
            if (this.remainingShield < 0)
                this.shielded = false;
        }
        this.grounded = false;
        var lastPos = this.pos.copy();
        //Check collisions on Y
        this.pos.y += this.vel.y;
        for (var _b = 0, _c = this.world.walls; _b < _c.length; _b++) {
            var wall = _c[_b];
            if (this.collides(wall)) {
                this.grounded = true;
                this.canJump = true;
                this.canAttack = true;
                this.canShield = true;
                if (!this.shielded)
                    this.remainingShield = this.SHIELD_TIME;
                if (!this.attacking)
                    this.attackingTime = this.ATTACK_TIME;
                this.vel.y = 0;
                this.pos.y = lastPos.y;
            }
        }
        this.walled = false;
        //Check collisions on X
        lastPos = this.pos.copy();
        this.pos.x += this.vel.x;
        for (var _d = 0, _e = this.world.walls; _d < _e.length; _d++) {
            var wall = _e[_d];
            if (this.collides(wall)) {
                this.walled = true;
                this.canAttack = true;
                this.canShield = true;
                if (this.shielded)
                    this.remainingShield = this.SHIELD_TIME;
                if (this.attacking)
                    this.attackingTime = this.ATTACK_TIME;
                this.vel.set(0, 0);
                this.pos.x = lastPos.x;
            }
        }
    };
    Player.prototype.atRange = function (target) {
        var targetVec = target.pos.copy();
        targetVec.substract(this.pos);
        var rangeSqr = this.ATTACK_RANGE * this.ATTACK_RANGE;
        return (targetVec.x * targetVec.x + targetVec.y * targetVec.y < rangeSqr);
    };
    Player.prototype.collides = function (b) {
        return !(this.pos.x + this.size.x / 2 < b.pos.x - b.size.x / 2 ||
            b.pos.x + b.size.x / 2 < this.pos.x - this.size.x / 2 ||
            this.pos.y + this.size.y / 2 < b.pos.y - b.size.y / 2 ||
            b.pos.y + b.size.y / 2 < this.pos.y - this.size.y / 2);
    };
    return Player;
}());
exports.Player = Player;

},{"./vector2d":4}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var Vector2D = /** @class */ (function () {
    function Vector2D(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2D.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Vector2D.prototype.sum = function (b) {
        this.x += b.x;
        this.y += b.y;
    };
    Vector2D.prototype.substract = function (b) {
        this.x -= b.x;
        this.y -= b.y;
    };
    Vector2D.prototype.mul = function (escalar) {
        this.x *= escalar;
        this.y *= escalar;
    };
    Vector2D.prototype.copy = function () {
        return new Vector2D(this.x, this.y);
    };
    Vector2D.dot = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    Vector2D.angleWithGround = function (a) {
        var angle = Math.atan2(a.x, a.y) * (180 / Math.PI);
        if (angle < 0)
            return angle * 2 * Math.PI;
        else
            return angle;
    };
    return Vector2D;
}());
exports.Vector2D = Vector2D;

},{}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var vector2d_1 = require("./vector2d");
var Wall = /** @class */ (function () {
    function Wall(color, pos, size) {
        this.color = color;
        this.pos = pos;
        this.size = size;
    }
    Wall.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2, this.size.x, this.size.y);
    };
    /*
        Returns the list of vertexes of the wall.
        Anti-Clockwise from top-right (in increasing angle order)
    */
    Wall.prototype.getPoints = function () {
        var res = [];
        //Top left
        res.push(new vector2d_1.Vector2D(this.pos.x - this.size.x / 2, this.pos.y - this.size.y / 2));
        //Bottom left
        res.push(new vector2d_1.Vector2D(this.pos.x - this.size.x / 2, this.pos.y + this.size.y / 2));
        //Bottom right
        res.push(new vector2d_1.Vector2D(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2));
        //Top right
        res.push(new vector2d_1.Vector2D(this.pos.x + this.size.x / 2, this.pos.y - this.size.y / 2));
        return res;
    };
    return Wall;
}());
exports.Wall = Wall;

},{"./vector2d":4}],6:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var World = /** @class */ (function () {
    function World(gravity, walls) {
        this.gravity = gravity;
        this.walls = walls;
    }
    World.prototype.draw = function (ctx) {
        for (var _i = 0, _a = this.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            wall.draw(ctx);
        }
    };
    return World;
}());
exports.World = World;

},{}]},{},[2]);
