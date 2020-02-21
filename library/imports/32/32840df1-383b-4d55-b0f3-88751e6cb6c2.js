"use strict";
cc._RF.push(module, '328403xODtNVbDziHUebLbC', 'Game');
// scripts/Game.js

'use strict';

var Player = require('Player');
cc.Class({
    extends: cc.Component,

    properties: {
        // 这个属性引用了星星预制资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
            default: null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            default: null,
            type: Player
        },
        // 分数
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        // 得分音效资源
        scoreAudio: {
            default: null,
            type: cc.AudioClip
        },
        // 开始按钮
        btnNode: {
            default: null,
            type: cc.Node
        },
        //游戏结束文字
        gameOverNode: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function onLoad() {
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;
        // 节点下的 y 属性对应的是锚点所在的 y 坐标，因为锚点默认在节点的中心，所以需要加上地面高度的一半才是地面的 y 坐标

        //是否每帧执行该组件的 update 方法，同时也用来控制渲染组件是否显示
        this.enabled = false;

        this.currentStar = null; // 记录最后一个星星的x坐标
        this.currentStarX = 0;
        // 初始化计时器
        this.timer = 0;
        this.starDuration = 0;
        //初始化星星池
        this.starPool = new cc.NodePool('Star');
    },

    onStartGame: function onStartGame() {
        this.enabled = true;
        // 初始化分数
        this.score = 0;
        this.scoreDisplay.string = 'Score: 0';
        // 让按钮跑到屏幕外
        this.btnNode.x = 3000;
        this.gameOverNode.active = false;
        // 重置怪兽的位置和移速
        this.player.startMoveAt(cc.v2(0, this.groundY));
        // 生成一个新的星星
        this.spawnNewStar();
    },

    spawnNewStar: function spawnNewStar() {
        var newStar = null;
        // 使用给定的模板在场景中生成一个新节点
        if (this.starPool.size() > 0) {
            newStar = this.starPool.get(this);
        } else {
            newStar = cc.instantiate(this.starPrefab);
            // instantiate克隆指定的任意类型的对象，或者从 Prefab 实例化出新节点，返回值为 Node 或者 Object
        }
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // node.addChild将新节点建立在该节点的下一级，所以新节点的显示效果在该节点之上

        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        // setPosition设置节点在父节点坐标系中的位置，可以通过两种方式设置坐标点。一是传入两个数值 x 和 y，二是传入类型为 cc.Vec2 的对象

        // 在星星组件上暂存 Game 对象的引用
        newStar.getComponent('Star').init(this);
        // getComponent得到该节点上挂载的组件引用

        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
        this.currentStar = newStar;
    },
    // 获取星星坐标
    getNewStarPosition: function getNewStarPosition() {
        // 如果没有星星，设置随机x
        if (!this.currentStar) {
            this.currentStarX = (Math.random() - 0.5) * 2 * this.node.width / 2;
        }
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        if (this.currentStarX >= 0) {
            randX = -Math.random() * maxX;
        } else {
            randX = Math.random() * maxX;
        }
        this.currentStarX = randX;
        // 返回星星坐标
        return cc.v2(randX, randY);
    },
    // 让star调用生成新星星
    despawnStar: function despawnStar(star) {
        this.starPool.put(star);
        this.spawnNewStar();
    },

    gainScore: function gainScore() {
        this.score += 1;
        // 更新分数的文字
        this.scoreDisplay.string = 'Score: ' + this.score;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },
    update: function update(dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },

    gameOver: function gameOver() {
        this.gameOverNode.active = true;
        this.player.enabled = false;
        this.player.stopMove();
        this.currentStar.destroy();
        this.btnNode.x = 0;
        // cc.director.loadScene('game');
        /* 管理你的游戏逻辑流程的单例对象
        由于 cc.director 是一个单例，你不需要调用任何构造函数或创建函数
        使用它的标准方法是调用 cc.director.methodName()
        这里就是重新加载游戏场景 game，也就是游戏重新开始
        */
    }
});

cc._RF.pop();