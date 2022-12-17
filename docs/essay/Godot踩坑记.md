# Godot踩坑记

* 当本机是 hiDPI 时，需要启用 `Project -> Project Settings -> Display -> Window -> Allow Hidpi`

* 主场景 - 项目运行时被载入的场景 `Project -> Project Settings -> Application -> Run  -> Main Scene` 必填

* 确保不同屏幕缩放正常 `Project -> Project Settings -> Display -> Window -> Streth -> Mode = 2d && Aspect = keep`

## 场景的切换

1. 新建全局脚本 `Global.gd`, `Project > Project Settings -> AutoLoad -> add` 全局脚本在任何场景都会最先加载

2. `root` 的子节点有 `Global.gd` + 当前场景

```js
// 在全局脚本里获取当前场景 
var root = get_tree().get_root()
current_scene = root.get_child(root.get_child_count() - 1)
```

3. 释放当前场景，替换为新的场景

```js
// Global.gd
func goto_scene(path):
 // 确保当前场景无代码在执行
 call_deferred("_deferred_foto_scene", path)
 
func _deferred_foto_scene(path):
 current_scene.free()
 var s = ResourceLoader.load(path)
 current_scene = s.instance()
 get_tree().get_root().add_child(current_scene)

```

```js
// Scene.gd
Global.goto_scene("res://Scene2.tscn")
```

## 导入像素素材

关闭 `filter`，并重新导入，防止模糊

`预设 - 2D Pixel`, 设为默认值，重新导入所有像素资源

## 屏幕尺寸

1. 320X180 Test 1280X720 4倍

2. `Streth` - `2D`

## 物理角色 - KinematicBody2D 设置确保对象的子项不可选择

	角色贴图 - Sprite

## ERR: `_update_root_rect: Font oversampling only works with the resize modes 'Keep Width', 'Keep Height', and 'Expand'.`

`Display -> Window -> Strech -> Aspect -> Keep`

## 层级 `ChangeType -> YSort` 层级根据Y轴排序

注意调整中点到碰撞区域的中心

## `onready var a = $Scene` 等同于

```py
func _ready():
 var a = $Scene
```

## `_physics_process` delta 恒定，涉及到物理引擎的信息，如玩家位置，在这里访问才精确

`_process` delta 变化，获取的物理信息，可能是上一帧的，因为物理引擎还没更新

`move_and_slide` 最好在 `_physics_process` 中使用

## `Collision` 碰撞层

`Layer Names -> 2d Physics` 设置五层Layer:

World - Player - PlayerHurtbox - EnemyHurtbox - Enemy - SoftCollision软碰撞层

每一个可碰撞节点都有 `Layer` 和 `Mask` 两种 `Collision`

Layer: 所在的层级  Mask: 所面向的层级

举例：

```
Player: Layer = Player  Mask = World 
player的攻击SwordHitbox: Layer = null  Mask = EnemyHurtbox
Enemy的Hurtbox: Layer = EnemyHurtbox  Mask = null
Enemy的Hitbox: Layer = null  Mask = PlayerHurtbox
```

## 角色状态如HP 用一个场景复用stats 类似hitbox、hurtbox

判断血量是否为空，判断逻辑写在stats里，用信号从stats发射到本体

类似组件间通信，父级向下调用，子级向上发信号

判断方法用`setget`出发，而不是在`_process`里
exp: `onready var health = max_health setget set_health`

赋值时加 `self.`才会被`setget` 响应

## camera

镜头跟随角色 开启`Current`

镜头缓慢移动 开启`Smoothing`

`Rendering -> Quality -> Use Pixel Snap` 让镜头对齐到整数像素

角色死亡后，子级的相机也会销毁，镜头会突然重置到原点
解：把`camera`移到外面，角色下面加个`RemoteTransform2D`,指定`camera`跟随自身
