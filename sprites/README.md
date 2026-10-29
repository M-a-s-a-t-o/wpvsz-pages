# 精灵素材

本地绘制完成：5 种植物、5 种僵尸、3 种投射物。游戏直接使用透明 PNG。

- plants/*.png：8 列 × 2 行，每格 96×96。第 0 行前 6 格为 idle，第 1 行 8 格为 attack；坚果第二行为防御表情。
- zombies/*.png：8 列 × 3 行。第 0 行 walk，第 1 行 attack，第 2 行 die，每组 8 帧。死亡播放 800ms；尸体不参与碰撞、寻敌或攻击，暂停时同时停止。
- projectiles/*.png：4 列 × 1 行，4 帧旋转。追踪尖刺随飞行方向旋转。
- manifest.json：尺寸、帧数、源帧顺序；普通僵尸的死亡关键姿势包含停顿帧。
- PROMPTS.json：原始动作提示词。
- ../../art/sprite-sources/：内置 imagegen 生成的原始 PNG 和 GENERATION_PROMPTS.json。

运行开发服务器后，访问 /sprites/index.html 可预览所有素材，切换动作、冰冻色调或逐帧查看。

SpriteVisual 使用 Vite BASE_URL，兼容 GitHub Pages 子路径。PNG 通过 SVG 视口裁切以保持纵横比；视口中没有矢量角色图形。

## 动画精调 v2

- 普通、路障、铁桶、巨人使用新的抬膝/迈步行走序列；首领沿用已生成像素原稿，使用髋膝双关节分层动画。
- 逐帧边界保存在 art/sprite-sources/zombie-frames.json，不再等分僵尸原稿；同类原稿使用统一比例，行走以头部锚点对齐。
- 普通/路障/铁桶行走 12fps，首领/巨人 8fps，攻击 12fps，死亡保持 800ms；冰冻步态以 0.55 倍播放，暂停保留当前相位。
- 僵尸与投射物位置使用每个游戏刻间的线性插值；碰撞与伤害计算保持原逻辑。
- 图册支持 0.5× 慢放和逐帧检查，也展示同一套首领关节步态。
- 安装可选 sharp 工具或设置 SHARP_MODULE 后，可运行 npm run validate:animation 检查源帧重叠、透明边界和孤立残片。
