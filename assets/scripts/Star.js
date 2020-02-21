cc.Class({
    extends: cc.Component,

    properties: {
        // 星星和主角之间的距离小于这个数值时，就会完成收集
        pickRadius: 0
    },

    onLoad: function() {
        this.enabled = false;
    },
    init: function(game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
    },

    reuse(game) {
        this.init(game);
    },
    update: function(dt) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }
        // 根据 Game 脚本中的计时器更新星星的透明度 做出星星消失的效果
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity =
            minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    },

    getPlayerDistance: function() {
        // 根据 player 节点位置判断距离
        var playerPos = this.game.player.getCenterPos();

        // 根据两点位置计算两点之间距离
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    },

    onPicked: function() {
        // 调用 Game 的得分方法
        this.game.gainScore();
        this.game.despawnStar(this.node);
    }
});
