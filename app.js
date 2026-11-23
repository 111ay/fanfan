/* =====================================================================
   一日三餐 · 今天吃什么盲盒
   vanilla JS / 无依赖 / 数据为演示用 mock
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------- 1. 配置与模拟数据 ---------------- */

  const GROUPS = [
    { id: 'student', emoji: '🎓', label: '大学生日常', tip: '💡 学生党吃法：优先蛋奶和深色蔬菜，别用泡面顶替晚餐，预算 12–20 元最划算。' },
    { id: 'fit',     emoji: '💪', label: '减脂健身',   tip: '💡 减脂关键：先选蛋白质（每餐 25g 以上），主食留一半粗粮，酱汁另装小盒。' },
    { id: 'mom',     emoji: '🤰', label: '孕妇营养',   tip: '💡 孕期提示：食物务必做熟，少油少盐，生腌、酒心和含咖啡因的饮品先绕开。' },
    { id: 'sick',    emoji: '🥣', label: '病人清淡',   tip: '💡 清淡吃法：温软、低盐、少油炸，汤面先撇油，肠胃不适时别贪凉食。' },
    { id: 'gout',    emoji: '🫘', label: '高尿酸/痛风友好', tip: '💡 控嘌呤：少喝浓肉汤和啤酒，多喝水，蛋白优先选蛋和奶，肉类按量称重。' }
  ];

  const BUDGETS = [
    { id: 'any',  label: '不限预算', test: () => true },
    { id: 'b10',  label: '10 元以内', min: 0,  max: 10 },
    { id: 'b20',  label: '10–20 元',  min: 10, max: 20 },
    { id: 'b30',  label: '20–30 元',  min: 20, max: 30 },
    { id: 'b40',  label: '30 元以上', min: 30, max: 999 }
  ].map(b => (b.test ? b : Object.assign({}, b, { test: p => p > b.min && p <= b.max })));

  const RESTRICTS = ['辣', '香菜', '葱蒜', '海鲜', '牛羊肉', '内脏', '油炸', '豆制品', '乳制品', '猪肉', '酒', '生冷', '高糖'];

  const BADGES = [
    { id: 'store', label: '周边便利店', ico: '🏪' },
    { id: 'ride',  label: '骑行送餐',   ico: '🚲' }
  ];

  const SORTS = [
    { id: 'smart', label: '综合推荐' },
    { id: 'cheap', label: '价格最低' },
    { id: 'rate',  label: '评分最高' },
    { id: 'light', label: '热量最低' }
  ];

  /** 生成菜品对象，参数顺序：名称/图标/价格/商家/星级 + 可选属性 */
  function mk(name, emoji, price, shop, stars, o) {
    return Object.assign({
      id: '', name, emoji, price, shop, stars,
      shopScore: o.s || 4.5,
      tags: o.t || [],
      kcal: o.k || 0,
      protein: o.p || 0,
      avoid: o.av || [],
      badges: o.bd || [],
      groups: o.g || [],
      hot: o.h || 1000,
      praise: o.f || 4.5,
      desc: o.d || ''
    });
  }

  const RAW = [
    /* —— 大学生日常 —— */
    mk('番茄鸡蛋盖饭', '🍅', 12, '食堂 · 家常窗口', 4.5, { s: 4.6, t: ['经济实惠', '维C'], k: 520, p: 22, av: ['葱蒜'], bd: ['store', 'ride'], g: ['student'], h: 9820, f: 4.8, d: '酸甜汤汁裹着滑蛋，十分钟就能吃上的踏实感。' }),
    mk('黄焖鸡米饭', '🍗', 15, '老李黄焖鸡', 4.5, { s: 4.7, t: ['高蛋白', '热乎'], k: 640, p: 38, av: ['辣', '葱蒜'], bd: ['ride'], g: ['student', 'sick'], h: 11200, f: 4.7, d: '一锅炖到鸡肉脱骨，汤汁拌饭是灵魂。' }),
    mk('兰州牛肉拉面', '🍜', 13, '马记拉面 · 清真', 4.5, { s: 4.8, t: ['汤热', '管饱'], k: 580, p: 26, av: ['牛羊肉', '葱蒜', '辣'], bd: ['store', 'ride'], g: ['student'], h: 8600, f: 4.8, d: '一清二白三红四绿，面能加细也能加宽。' }),
    mk('麻辣香锅（自选）', '🌶️', 22, '辣府香锅', 4, { s: 4.4, t: ['解馋', '可自选'], k: 760, p: 30, av: ['辣', '葱蒜', '油炸'], bd: ['ride'], g: ['student'], h: 10400, f: 4.4, d: '按克称重自己搭配，最后一勺白芝麻很上头。' }),
    mk('沙县小炒 + 炖罐', '🍲', 16, '沙县小吃', 4, { s: 4.3, t: ['快', '有汤'], k: 540, p: 25, av: ['葱蒜'], bd: ['store', 'ride'], g: ['student', 'sick'], h: 7300, f: 4.5, d: '一份小炒配一盅排骨汤，深夜也开着门。' }),
    mk('肉夹馍 + 凉皮套餐', '🥙', 11, '老陕面馆', 4.5, { s: 4.5, t: ['省钱', '双拼'], k: 480, p: 16, av: ['辣', '香菜', '葱蒜'], bd: ['store'], g: ['student'], h: 6400, f: 4.6, d: '馍脆皮、肉多汁，凉皮解腻一步到位。' }),
    mk('柳州螺蛳粉', '🍜', 14, '嗦粉研究所', 4, { s: 4.2, t: ['上瘾', '重口'], k: 610, p: 18, av: ['辣', '香菜', '葱蒜', '油炸', '豆制品', '内脏'], bd: ['store', 'ride'], g: ['student'], h: 9100, f: 4.3, d: '酸笋上头，腐竹吸汤，加个卤蛋更完整。' }),
    mk('蛋炒饭 + 紫菜汤', '🍳', 9, '深夜食堂窗口', 4, { s: 4.1, t: ['经济实惠', '蛋足'], k: 470, p: 15, av: ['葱蒜'], bd: ['store'], g: ['student', 'sick'], h: 5200, f: 4.4, d: '米饭粒粒分明，配一碗免费例汤。' }),
    mk('鸡排三明治套餐', '🥪', 15, '麦香坊轻食', 4, { s: 4.4, t: ['快手', '有蔬菜'], k: 530, p: 29, av: ['油炸', '乳制品'], bd: ['store', 'ride'], g: ['student', 'fit'], h: 4800, f: 4.5, d: '两块全麦夹三层，配无糖乌龙茶。' }),
    mk('张记麻辣烫（可选清汤）', '🥬', 18, '张记麻辣烫', 4.5, { s: 4.5, t: ['可选清汤', '蔬菜自由'], k: 560, p: 24, av: ['辣', '油炸', '豆制品'], bd: ['ride'], g: ['student', 'fit'], h: 8900, f: 4.6, d: '自己夹菜自己称重，清汤锅底不加油辣。' }),
    mk('豆浆油条早餐套餐', '🥢', 6, '巷口早点摊', 4.5, { s: 4.3, t: ['现磨', '便宜'], k: 420, p: 12, av: ['油炸', '豆制品'], bd: ['store'], g: ['student'], h: 3900, f: 4.5, d: '六块钱吃撑，豆浆要无糖的那锅。' }),
    mk('香菇滑鸡饭', '🍄', 14, '食堂 · 粤味窗口', 4, { s: 4.4, t: ['低油', '菌香'], k: 510, p: 28, av: ['葱蒜'], bd: ['ride'], g: ['student', 'sick'], h: 4200, f: 4.6, d: '香菇的鲜把鸡肉裹住，饭底还有一层汁。' }),

    /* —— 减脂健身 —— */
    mk('鸡胸藜麦能量碗', '🥗', 28, 'FitBowl 轻食研究所', 5, { s: 4.8, t: ['低卡高蛋白', '控碳'], k: 380, p: 34, av: ['葱蒜'], bd: ['ride'], g: ['fit', 'mom'], h: 12800, f: 4.9, d: '低温慢煮鸡胸不柴，藜麦代替白米饭。' }),
    mk('黑椒牛肉意面', '🍝', 32, 'Pasta Lab', 4.5, { s: 4.6, t: ['高蛋白', '饱腹'], k: 560, p: 36, av: ['牛羊肉', '葱蒜'], bd: ['ride'], g: ['fit'], h: 7600, f: 4.7, d: '意面煮到 al dente，黑椒现磨提香。' }),
    mk('香煎三文鱼配芦笋', '🐟', 45, '深海食堂', 5, { s: 4.9, t: ['优质脂肪', 'Omega-3'], k: 470, p: 38, av: ['海鲜'], bd: ['ride'], g: ['fit', 'mom'], h: 9400, f: 4.9, d: '鱼皮煎脆、内里微润，只撒海盐和黑胡椒。' }),
    mk('美式牛排沙拉', '🥩', 38, 'Green House', 4.5, { s: 4.7, t: ['低碳水', '高蛋白'], k: 420, p: 40, av: ['牛羊肉', '生冷', '葱蒜'], bd: ['ride'], g: ['fit'], h: 6800, f: 4.6, d: '西冷切条冷食拌油醋汁，练后一小时吃刚好。' }),
    mk('紫薯鸡胸卷', '🍠', 22, '轻食便当铺', 4.5, { s: 4.5, t: ['粗粮', '便携'], k: 340, p: 31, av: [], bd: ['store', 'ride'], g: ['fit', 'gout'], h: 8200, f: 4.7, d: '紫薯泥铺底卷鸡胸，一个刚好补完蛋白。' }),
    mk('虾仁牛油果拌饭', '🍤', 36, '深海食堂', 4, { s: 4.6, t: ['优质脂肪', '高蛋白'], k: 490, p: 33, av: ['海鲜', '生冷'], bd: ['ride'], g: ['fit'], h: 6100, f: 4.5, d: '熟虾仁配牛油果，糙米饭打底不升糖太快。' }),
    mk('水煮毛豆 + 无糖酸奶', '🫘', 12, '楼下便利屋', 4, { s: 4.2, t: ['植物蛋白', '加餐'], k: 210, p: 19, av: ['豆制品', '乳制品'], bd: ['store'], g: ['fit'], h: 5400, f: 4.4, d: '练前后的小份双拼，蛋白质够、热量低。' }),
    mk('去油日式豚骨拉面', '🍜', 26, '马记拉面 · 清真', 4, { s: 4.4, t: ['减油版', '热乎'], k: 430, p: 27, av: ['猪肉', '葱蒜'], bd: ['ride'], g: ['fit', 'student'], h: 4700, f: 4.3, d: '汤底撇去浮油，叉心蛋减半糖。' }),
    mk('希腊酸奶燕麦杯', '🥣', 16, 'FitBowl 轻食研究所', 4.5, { s: 4.7, t: ['高蛋白', '无添加糖'], k: 300, p: 21, av: ['乳制品', '高糖'], bd: ['store', 'ride'], g: ['fit', 'mom'], h: 7100, f: 4.8, d: '浓稠酸奶 layer 燕麦和蓝莓，早上带一杯。' }),
    mk('烤鸡腿杂粮饭', '🍗', 25, '食堂 · 减脂窗口', 4.5, { s: 4.5, t: ['去皮可控', '高蛋白'], k: 450, p: 35, av: [], bd: ['ride'], g: ['fit', 'student'], h: 6600, f: 4.6, d: '带皮烤不额外抹油，去皮能再省 60 大卡。' }),
    mk('蛋白奶昔 + 香蕉', '🥤', 18, '训练补给站', 4, { s: 4.3, t: ['快速补蛋白', '练后'], k: 260, p: 28, av: ['乳制品', '高糖'], bd: ['store'], g: ['fit'], h: 5900, f: 4.4, d: '一勺乳清配一根香蕉，练完 30 分钟内喝掉。' }),
    mk('豆腐蔬菜煲（少油）', '🍲', 19, '清欢素食', 4, { s: 4.4, t: ['植物蛋白', '高纤维'], k: 280, p: 17, av: ['豆制品', '葱蒜'], bd: ['ride'], g: ['fit', 'gout'], h: 4100, f: 4.5, d: '老豆腐炖时蔬，汤汁浓但不加明油。' }),

    /* —— 孕妇营养 —— */
    mk('番茄龙利鱼汤', '🐟', 38, '深海食堂', 5, { s: 4.8, t: ['低汞鱼', '全熟'], k: 320, p: 30, av: ['海鲜', '葱蒜'], bd: ['ride'], g: ['mom'], h: 6300, f: 4.9, d: '无刺鱼柳煮到全熟，番茄的酸刚好开胃。' }),
    mk('菠菜猪肝补气套餐', '🥬', 32, '粤味炖品', 4, { s: 4.5, t: ['补铁', '配维C'], k: 400, p: 28, av: ['内脏', '酒', '葱蒜'], bd: ['ride'], g: ['mom'], h: 3600, f: 4.4, d: '猪肝按周一次适量，配橙片帮助铁吸收。' }),
    mk('山药排骨汤', '🍖', 36, '妈妈煲汤屋', 4.5, { s: 4.7, t: ['补钙', '温润'], k: 460, p: 26, av: ['猪肉'], bd: ['ride'], g: ['mom', 'sick'], h: 5800, f: 4.7, d: '小火两小时，汤面不浮油，山药炖到发绵。' }),
    mk('清蒸鲈鱼（少盐）', '🐟', 42, '深海食堂', 4.5, { s: 4.8, t: ['全熟', 'DHA'], k: 300, p: 32, av: ['海鲜'], bd: ['ride'], g: ['mom', 'sick'], h: 4400, f: 4.8, d: '姜丝去腥、豉油另碟，鱼肉蒸到刚断生。' }),
    mk('红枣枸杞乌鸡汤', '🍲', 40, '妈妈煲汤屋', 4.5, { s: 4.6, t: ['温补', '低脂'], k: 380, p: 24, av: ['猪肉'], bd: ['ride'], g: ['mom'], h: 6900, f: 4.7, d: '乌鸡去皮炖，红枣只放三颗不抢甜。' }),
    mk('核桃黑芝麻糊', '🥣', 18, '谷养坊', 4, { s: 4.4, t: ['优质脂肪', '无糖版'], k: 290, p: 8, av: ['高糖'], bd: ['store'], g: ['mom'], h: 3200, f: 4.5, d: '石磨现打，可选无糖版本当加餐。' }),
    mk('牛奶燕麦粥', '🥣', 15, '早餐工程车', 4.5, { s: 4.5, t: ['补钙', '膳食纤维'], k: 310, p: 14, av: ['乳制品'], bd: ['store', 'ride'], g: ['mom', 'fit', 'sick'], h: 4900, f: 4.6, d: '牛奶煮燕麦不加糖，香蕉片最后铺。' }),
    mk('三色藜麦南瓜饭', '🎃', 26, 'FitBowl 轻食研究所', 4, { s: 4.6, t: ['控糖', '高纤维'], k: 360, p: 11, av: [], bd: ['ride'], g: ['mom', 'gout'], h: 3700, f: 4.5, d: '南瓜蒸甜代替糖，藜麦把白米换掉一半。' }),
    mk('番茄牛肉丸汤', '🍅', 34, '粤味炖品', 4, { s: 4.5, t: ['补铁', '高蛋白'], k: 340, p: 31, av: ['牛羊肉', '葱蒜'], bd: ['ride'], g: ['mom'], h: 4200, f: 4.6, d: '手打牛丸全熟煮透，番茄先炒出沙。' }),
    mk('清炒时蔬 + 蒸蛋', '🥚', 22, '食堂 · 家常窗口', 4.5, { s: 4.4, t: ['全熟', '易消化'], k: 230, p: 15, av: ['葱蒜'], bd: ['store', 'ride'], g: ['mom', 'sick', 'gout'], h: 5100, f: 4.6, d: '蛋羹嫩到能照镜子，青菜只放一点盐。' }),
    mk('芝士焗西兰花', '🧀', 26, 'Green House', 4, { s: 4.3, t: ['补钙', '熟制'], k: 390, p: 20, av: ['乳制品'], bd: ['ride'], g: ['mom'], h: 2900, f: 4.3, d: '西兰花焯透再焗，芝士选巴氏杀菌的。' }),
    mk('虾仁滑蛋', '🍤', 30, '粤味炖品', 4.5, { s: 4.6, t: ['高蛋白', '全熟'], k: 330, p: 29, av: ['海鲜', '葱蒜'], bd: ['ride'], g: ['mom', 'fit'], h: 5600, f: 4.7, d: '虾仁炒到全熟再收蛋，不留溏心。' }),

    /* —— 病人清淡 —— */
    mk('小米南瓜粥', '🥣', 12, '康复小灶', 5, { s: 4.7, t: ['易消化', '温热'], k: 180, p: 4, av: [], bd: ['store', 'ride'], g: ['sick', 'gout'], h: 7400, f: 4.9, d: '小米熬到出米油，南瓜自带甜不用加糖。' }),
    mk('清蒸蛋羹', '🥚', 14, '康复小灶', 4.5, { s: 4.6, t: ['软嫩', '优质蛋白'], k: 150, p: 12, av: [], bd: ['store', 'ride'], g: ['sick', 'mom'], h: 6200, f: 4.8, d: '温水化蛋、过筛去泡，只滴两滴香油。' }),
    mk('清汤龙须面', '🍜', 13, '巷口面档', 4, { s: 4.4, t: ['少盐', '热汤'], k: 260, p: 8, av: ['葱蒜'], bd: ['ride'], g: ['sick'], h: 4800, f: 4.6, d: '面煮到发软，汤里只放少许盐和青菜丝。' }),
    mk('蔬菜豆腐羹', '🍲', 16, '清欢素食', 4.5, { s: 4.5, t: ['软滑', '植物蛋白'], k: 200, p: 13, av: ['豆制品'], bd: ['ride'], g: ['sick'], h: 3900, f: 4.6, d: '内酯豆腐划小方块，勾薄芡不油腻。' }),
    mk('山药瘦肉粥', '🍖', 18, '康复小灶', 4.5, { s: 4.6, t: ['健脾', '补蛋白'], k: 250, p: 14, av: ['猪肉'], bd: ['ride'], g: ['sick', 'student'], h: 4300, f: 4.7, d: '瘦肉剁碎打粥，山药切小丁煮到透明。' }),
    mk('清炒丝瓜', '🥒', 17, '清欢素食', 4, { s: 4.3, t: ['少油', '当季'], k: 130, p: 3, av: ['葱蒜'], bd: ['ride'], g: ['sick', 'gout'], h: 2600, f: 4.4, d: '丝瓜去皮炒到发软，只放一点点盐。' }),
    mk('番茄鸡蛋汤面', '🍅', 15, '巷口面档', 4.5, { s: 4.5, t: ['开胃', '易消化'], k: 300, p: 13, av: ['葱蒜'], bd: ['store', 'ride'], g: ['sick', 'student'], h: 5500, f: 4.7, d: '番茄炒出沙再下面，酸酸暖暖的。' }),
    mk('香菇鸡肉丸（清蒸）', '🍄', 22, '康复小灶', 4, { s: 4.5, t: ['低油', '高蛋白'], k: 220, p: 22, av: ['葱蒜'], bd: ['ride'], g: ['sick', 'fit'], h: 3400, f: 4.5, d: '鸡胸自己打丸，清蒸不用一滴油。' }),
    mk('玉米须冬瓜汤', '🌽', 14, '康复小灶', 4, { s: 4.2, t: ['清淡', '无盐版可选'], k: 90, p: 2, av: [], bd: ['ride'], g: ['sick'], h: 2200, f: 4.3, d: '玉米须入汤提甜，可不加盐直接喝。' }),
    mk('白灼秋葵', '🥬', 18, '清欢素食', 4, { s: 4.3, t: ['高纤维', '低脂'], k: 80, p: 3, av: ['生冷'], bd: ['ride'], g: ['sick', 'gout'], h: 2800, f: 4.4, d: '整根焯熟再切，酱汁另外蘸着吃。' }),
    mk('银耳莲子羹', '🍮', 16, '妈妈煲汤屋', 4.5, { s: 4.4, t: ['温润', '无糖可选'], k: 140, p: 3, av: ['高糖'], bd: ['store'], g: ['sick'], h: 3100, f: 4.5, d: '炖到胶质拉丝，代糖代替冰糖。' }),
    mk('鳕鱼粥', '🐟', 24, '深海食堂', 4.5, { s: 4.7, t: ['细嫩', '优质蛋白'], k: 240, p: 18, av: ['海鲜'], bd: ['ride'], g: ['sick', 'mom'], h: 3800, f: 4.7, d: '鳕鱼去刺碾碎，米粥熬到绵滑。' }),

    /* —— 高尿酸 / 痛风友好 —— */
    mk('蛋奶素意面', '🍝', 24, 'Pasta Lab', 4.5, { s: 4.6, t: ['低嘌呤', '蛋奶蛋白'], k: 430, p: 18, av: ['乳制品', '葱蒜'], bd: ['ride'], g: ['gout'], h: 4100, f: 4.6, d: '没有肉也没有海鲜，靠帕玛森和蛋提香。' }),
    mk('清炒西兰花糙米饭', '🥦', 20, '清欢素食', 4.5, { s: 4.5, t: ['低嘌呤', '高纤维'], k: 360, p: 11, av: ['葱蒜'], bd: ['store', 'ride'], g: ['gout', 'fit'], h: 5200, f: 4.7, d: '西兰花焯水断生，糙米饭单独称重 150g。' }),
    mk('低嘌呤鸡胸沙拉', '🥗', 28, 'FitBowl 轻食研究所', 4, { s: 4.7, t: ['控嘌呤', '低脂蛋白'], k: 320, p: 32, av: ['生冷', '葱蒜'], bd: ['ride'], g: ['gout', 'fit'], h: 4600, f: 4.5, d: '鸡胸按 100g 定量，油醋汁代替酱料。' }),
    mk('番茄豆腐煲', '🍅', 19, '清欢素食', 4, { s: 4.3, t: ['植物蛋白', '少油'], k: 240, p: 14, av: ['豆制品'], bd: ['ride'], g: ['gout', 'sick'], h: 3300, f: 4.4, d: '豆腐按一份 100g 计算，汤不浓嘌呤低。' }),
    mk('去浓汤玉米山药煲', '🌽', 26, '康复小灶', 4.5, { s: 4.5, t: ['不加老火汤', '清淡'], k: 260, p: 9, av: ['猪肉'], bd: ['ride'], g: ['gout', 'sick'], h: 3700, f: 4.6, d: '刻意不用长时间熬的肉汤，嘌呤更友好。' }),
    mk('牛奶燕麦杯', '🥣', 15, '早餐工程车', 4.5, { s: 4.4, t: ['低嘌呤', '补钙'], k: 250, p: 10, av: ['乳制品'], bd: ['store'], g: ['gout', 'mom'], h: 4000, f: 4.5, d: '奶和燕麦是痛风餐桌上的安全牌。' }),
    mk('胡萝卜姜黄糙米饭', '🍚', 22, 'Green House', 4, { s: 4.2, t: ['蔬菜为主', '粗粮'], k: 340, p: 8, av: [], bd: ['ride'], g: ['gout'], h: 2400, f: 4.3, d: '姜黄炒饭上色，全程不放肉不放虾皮。' }),
    mk('蒸蛋 + 全麦馒头', '🥚', 16, '早餐工程车', 4.5, { s: 4.3, t: ['蛋奶蛋白', '软'], k: 290, p: 15, av: [], bd: ['store', 'ride'], g: ['gout', 'sick'], h: 3500, f: 4.5, d: '最朴素也最稳的一餐，配一大杯水。' }),
    mk('白灼芥蓝', '🥬', 21, '清欢素食', 4, { s: 4.3, t: ['绿叶菜', '低脂'], k: 110, p: 5, av: ['葱蒜'], bd: ['ride'], g: ['gout', 'sick'], h: 2100, f: 4.4, d: '大火焯 40 秒，蒜蓉另放可自行取舍。' }),
    mk('圣女果坚果酸奶', '🍅', 18, '楼下便利屋', 4.5, { s: 4.4, t: ['控嘌呤', '加餐'], k: 260, p: 12, av: ['乳制品'], bd: ['store'], g: ['gout', 'fit'], h: 3000, f: 4.6, d: '便利店就能凑齐的一盒，不用开火。' }),
    mk('紫菜蛋花汤 + 杂粮饭', '🍲', 17, '食堂 · 家常窗口', 4, { s: 4.2, t: ['少油', '热乎'], k: 300, p: 11, av: ['海鲜', '葱蒜'], bd: ['store', 'ride'], g: ['gout', 'student'], h: 2700, f: 4.3, d: '紫菜量控制在一小片，蛋花打得细。' }),
    mk('南瓜百合小米饭', '🎃', 20, '谷养坊', 4.5, { s: 4.4, t: ['低嘌呤', '无肉'], k: 320, p: 7, av: [], bd: ['ride'], g: ['gout', 'sick'], h: 3100, f: 4.6, d: '全素一锅焖，南瓜的甜把整碗撑起来。' })
  ];

  const DISHES = RAW.map((d, i) => (d.id = 'd' + (i + 1), d));
  const BY_ID = new Map(DISHES.map(d => [d.id, d]));

  /* ---------------- 2. 状态 ---------------- */

  const state = {
    group: 'student',
    budget: 'any',
    avoid: new Set(),
    badges: new Set(),
    sort: 'smart',
    favOnly: false,
    favs: new Set(load('ysc-favs')),
    wheelPool: [],
    spinning: false,
    rotation: 0,
    lastDish: null
  };

  function load(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 隐私模式下忽略 */ } }
  function saveFavs() { save('ysc-favs', [...state.favs]); }

  /* ---------------- 3. DOM 引用 ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const el = {
    tabs: $('#tabs'), tabsNote: $('#groupNote'),
    budget: $('#budgetChips'), avoid: $('#avoidChips'), badges: $('#badgeChips'),
    wheel: $('#wheel'), wheelInner: $('#wheelInner'), wheelHub: $('#wheelHub'),
    spinBtn: $('#spinBtn'), reshuffle: $('#reshuffleBtn'), candCount: $('#candCount'),
    reveal: $('#reveal'), revealCard: $('#revealCard'), rcBack: $('#rcBack'), revealActions: $('#revealActions'),
    grid: $('#dishGrid'), listCount: $('#listCount'), sorts: $('#sortTabs'),
    empty: $('#emptyState'), hotBoard: $('#hotBoard'), praiseBoard: $('#praiseBoard'),
    healthTip: $('#healthTip'), toast: $('#toast'), favCount: $('#favCount'),
    mealSlot: $('#mealSlot'), clock: $('#clock'), resetFilter: $('#resetFilterBtn')
  };

  /* ---------------- 4. 数据筛选 ---------------- */

  /** 当前条件下所有可点的菜（人群 + 预算 + 忌口 + 取餐方式） */
  function candidates(includeGroup) {
    const budget = BUDGETS.find(b => b.id === state.budget);
    return DISHES.filter(d => {
      if (includeGroup !== false && !d.groups.includes(state.group)) return false;
      if (!budget.test(d.price)) return false;
      for (const r of state.avoid) if (d.avoid.includes(r)) return false;
      for (const b of state.badges) if (!d.badges.includes(b)) return false;
      return true;
    });
  }

  function smartScore(d) {
    const g = GROUPS.findIndex(x => x.id === state.group);
    return d.praise * 22 + d.stars * 6 + d.hot / 2200 - d.price * 0.35 + (14 - d.kcal / 60) - g * 0.1;
  }

  function sortList(list) {
    const arr = list.slice();
    if (state.sort === 'cheap') arr.sort((a, b) => a.price - b.price);
    else if (state.sort === 'rate') arr.sort((a, b) => b.praise - a.praise);
    else if (state.sort === 'light') arr.sort((a, b) => a.kcal - b.kcal);
    else arr.sort((a, b) => smartScore(b) - smartScore(a));
    return arr;
  }

  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- 5. 小组件：五角星 ---------------- */
  function starsHTML(rating) {
    const pct = Math.max(0, Math.min(100, rating / 5 * 100));
    return `<span class="stars" aria-label="${rating} 星，满分 5 星"><span class="stars-bg">★★★★★</span>` +
      `<span class="stars-fg" style="width:${pct}%">★★★★★</span></span>`;
  }
  function tagsHTML(tags, warn) {
    return tags.map(t => {
      const hit = warn && state.avoid.has(t);
      return `<span class="tag ${hit ? 't-warn' : (/[0-9]/.test(t) || t.includes('脂肪') ? 't-amber' : '')}">${esc(t)}</span>`;
    }).join('');
  }
  function badgesHTML(d) {
    if (!d.badges.length) return '<span class="bdg">🥡 仅到店自取</span>';
    return d.badges.map(id => {
      const b = BADGES.find(x => x.id === id);
      return `<span class="bdg ${id === 'ride' ? 'b-amber' : ''}">${b.ico} ${b.label}</span>`;
    }).join('');
  }

  /* ---------------- 6. 渲染：Tab / 条件 ---------------- */

  function renderTabs() {
    el.tabs.innerHTML = GROUPS.map(g =>
      `<button class="tab ${g.id === state.group ? 'is-active' : ''}" role="tab" data-g="${g.id}"` +
      ` aria-selected="${g.id === state.group}"><span class="t-emoji">${g.emoji}</span>${g.label}</button>`
    ).join('') + '<span class="tab-pill" id="tabPill"></span>';
    movePill();
    const g = GROUPS.find(x => x.id === state.group);
    el.tabsNote.innerHTML = `当前场景：<b>${g.label}</b> · 共 ${DISHES.filter(d => d.groups.includes(g.id)).length} 道菜参与推荐`;
    el.healthTip.textContent = g.tip;
  }

  function movePill() {
    const active = el.tabs.querySelector('.tab.is-active');
    const pill = $('#tabPill');
    if (!active || !pill) return;
    pill.style.width = active.offsetWidth + 'px';
    pill.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function renderChips() {
    el.budget.innerHTML = BUDGETS.map(b =>
      `<button class="chip ${b.id === state.budget ? 'is-on' : ''}" data-budget="${b.id}">${b.label}</button>`).join('');

    el.avoid.innerHTML = RESTRICTS.map(r =>
      `<button class="chip ${state.avoid.has(r) ? 'is-on' : ''}" data-avoid="${r}"><span class="c-dot"></span>${r}</button>`).join('');

    el.badges.innerHTML = BADGES.map(b =>
      `<button class="chip ${state.badges.has(b.id) ? 'is-on' : ''}" data-badge="${b.id}">${b.ico} ${b.label}</button>`).join('') +
      `<button class="chip ${state.favOnly ? 'is-on' : ''}" data-fav="1">♥ 只看收藏</button>`;

    el.sorts.innerHTML = SORTS.map(s =>
      `<button class="sort ${s.id === state.sort ? 'is-on' : ''}" data-sort="${s.id}">${s.label}</button>`).join('');
  }

  /* ---------------- 7. 渲染：列表 / 榜单 ---------------- */

  function cardHTML(d, idx) {
    const fav = state.favs.has(d.id);
    const conflict = d.avoid.filter(a => state.avoid.has(a));
    return `<article class="card ${state.lastDish === d.id ? 'is-win' : ''}" style="animation-delay:${Math.min(idx, 12) * 28}ms" data-id="${d.id}">
      <div class="c-top">
        <span class="c-emoji">${d.emoji}</span>
        <div class="c-title">
          <h3 class="c-name">${esc(d.name)}</h3>
          <p class="c-desc">${esc(d.desc)}</p>
        </div>
        <button class="c-fav ${fav ? 'is-on' : ''}" data-fav-id="${d.id}" aria-label="收藏 ${esc(d.name)}">${fav ? '♥' : '♡'}</button>
      </div>
      <div class="c-meta">
        <span class="c-price"><i>¥</i>${d.price}</span>
        <span class="c-kcal">${d.kcal} kcal · 蛋白 ${d.protein}g</span>
      </div>
      <div class="c-shop">
        <span class="s-ico">🏠</span><span>${esc(d.shop)}</span>
        <span class="s-score">店 ${d.shopScore.toFixed(1)}</span>
      </div>
      <div class="c-row">${starsHTML(d.stars)}<span class="pct">${d.praise.toFixed(1)} 分</span></div>
      <div class="c-row">${tagsHTML(d.tags.concat(conflict.map(c => '含' + c)), true)}</div>
      <div class="c-badges">${badgesHTML(d)}</div>
      <div class="c-foot">
        <span class="pct">今日点单 ${d.hot >= 10000 ? (d.hot / 10000).toFixed(1) + '万' : d.hot} 次</span>
        <button class="mini-btn" data-eat="${d.id}">就吃它</button>
      </div>
    </article>`;
  }

  function renderList() {
    let list = candidates();
    if (state.favOnly) list = list.filter(d => state.favs.has(d.id));
    list = sortList(list);
    el.grid.innerHTML = list.map(cardHTML).join('');
    el.empty.hidden = list.length > 0;
    el.grid.hidden = list.length === 0;
    const g = GROUPS.find(x => x.id === state.group);
    el.listCount.textContent = `${g.label} · ${list.length} 道符合条件` +
      (state.avoid.size ? ` · 已避开 ${[...state.avoid].join('、')}` : '');
  }

  function boardRow(d, i, valText, subText) {
    return `<li data-id="${d.id}">
      <span class="rank r${i + 1}">${i + 1}</span>
      <span style="font-size:18px">${d.emoji}</span>
      <span class="b-name">${esc(d.name)}</span>
      <span class="b-sub">${esc(d.shop)}</span>
      <span class="b-val">${valText}</span>
      <button class="mini-btn" data-eat="${d.id}" style="margin:0">¥${d.price}</button>
    </li>` + (subText || '');
  }

  function renderBoards() {
    const pool = DISHES.filter(d => d.groups.includes(state.group));
    const base = pool.length >= 5 ? pool : DISHES;
    const hot = base.slice().sort((a, b) => b.hot - a.hot).slice(0, 5);
    const praise = base.slice().sort((a, b) => b.praise - a.praise || b.stars - a.stars).slice(0, 5);
    el.hotBoard.innerHTML = hot.map((d, i) =>
      boardRow(d, i, d.hot >= 10000 ? (d.hot / 10000).toFixed(1) + '万' : d.hot)).join('');
    el.praiseBoard.innerHTML = praise.map((d, i) =>
      boardRow(d, i, d.praise.toFixed(1) + '分')).join('');
  }

  /* ---------------- 8. 转盘 ---------------- */

  const SLICES = 10;
  const PALETTE = ['#c8ecd6', '#ffe6a8', '#b6e8c8', '#ffd98f', '#cdeeda', '#ffe3b0', '#bfe9cf', '#ffdca0', '#d4efe0', '#ffe9bc'];

  function buildWheel() {
    let pool = candidates();
    if (pool.length === 0) {
      el.wheelInner.innerHTML = '<div class="w-label" style="--a:0deg"><span>暂无可选菜品</span></div>';
      el.wheel.style.background = 'repeating-conic-gradient(#f1f5f2 0 18deg, #fafcfa 18deg 36deg)';
      state.wheelPool = [];
      el.candCount.textContent = '0';
      return;
    }
    if (pool.length > SLICES) pool = shuffle(pool).slice(0, SLICES);
    else pool = shuffle(pool);
    state.wheelPool = pool;

    const n = pool.length, seg = 360 / n;
    el.wheel.style.background = 'conic-gradient(' +
      PALETTE.slice(0, n).map((c, i) => `${c} ${(i * seg).toFixed(3)}deg ${((i + 1) * seg).toFixed(3)}deg`).join(',') + ')';
    el.wheelInner.innerHTML = pool.map((d, i) =>
      `<div class="w-label" style="--a:${(i * seg + seg / 2).toFixed(2)}deg"><span>${esc(d.name.slice(0, 5))}</span></div>`).join('');
    el.candCount.textContent = String(candidates().length);
  }

  let spinTimer = null;
  function spin() {
    if (state.spinning) return;
    const pool = state.wheelPool;
    if (!pool.length) { toast('没有符合条件的菜啦，先放宽一下条件 🥲'); return; }

    state.spinning = true;
    el.spinBtn.disabled = true;
    el.revealCard.classList.remove('is-flipped');
    const wrap = $('.wheel-wrap');
    if (wrap) wrap.classList.remove('is-ready');
    const target = pool[Math.floor(Math.random() * pool.length)];
    const n = pool.length, seg = 360 / n;
    const center = pool.indexOf(target) * seg + seg / 2;
    const land = (360 - center) % 360;
    const now = ((state.rotation % 360) + 360) % 360;
    let delta = land - now; if (delta <= 0) delta += 360;
    // 落点留一点随机偏移，避免每次都精准停在扇区中线上
    state.rotation += 360 * 4 + delta + (Math.random() - 0.5) * seg * 0.55;
    el.wheel.style.transform = `rotate(${state.rotation}deg)`;
    el.wheelHub.firstElementChild.textContent = '🎲';
    state.luck = 60 + Math.floor(Math.random() * 40);

    let settled = false;
    const finish = ev => {
      if (settled || (ev && ev.target !== el.wheel)) return;
      settled = true;
      clearTimeout(spinTimer);
      state.spinning = false;
      el.spinBtn.disabled = false;
      el.wheelHub.firstElementChild.textContent = target.emoji;
      state.lastDish = target.id;
      renderResult(target);
      el.revealCard.classList.add('is-flipped');
      renderList();
      if (wrap) wrap.classList.add('is-ready');
      toast(`${target.emoji} 手气不错：${target.name}`);
    };
    el.wheel.addEventListener('transitionend', finish, { once: true });
    spinTimer = setTimeout(finish, 4200); // 兜底：页面后台化时过渡事件可能不派发
  }

  function renderResult(d) {
    if (!d) {
      el.rcBack.innerHTML = `<span class="rc-emoji">🤔</span><h3 class="rc-name">还没想好</h3>`;
      el.revealActions.innerHTML = '';
      return;
    }
    const luck = state.luck || 88;
    el.rcBack.innerHTML = `
      <span class="rc-luck">今日手气 ${luck}</span>
      <span class="rc-emoji">${d.emoji}</span>
      <h3 class="rc-name">${esc(d.name)}</h3>
      <div class="rc-price"><small style="font-size:13px">¥</small>${d.price}<small>预估 · ${esc(d.shop)}</small></div>
      <p class="rc-shop">${starsHTML(d.stars)} 好评 ${d.praise.toFixed(1)} · ${d.kcal} kcal · 蛋白 ${d.protein}g</p>
      <div class="rc-tags">${tagsHTML(d.tags)}</div>
      <div class="rc-tags">${badgesHTML(d)}</div>`;
    el.revealActions.innerHTML = `
      <button class="btn-sm btn-primary" data-eat="${d.id}">🧾 看详情</button>
      <button class="btn-sm btn-ghost" data-fav-id="${d.id}">${state.favs.has(d.id) ? '♥ 已收藏' : '♡ 收藏'}</button>
      <button class="btn-sm btn-ghost" id="againBtn">🎲 再抽一次</button>`;
  }

  /* ---------------- 9. 交互绑定 ---------------- */

  el.tabs.addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (!t) return;
    state.group = t.dataset.g;
    renderTabs(); renderChips(); refreshAll();
  });

  el.tabs.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = GROUPS.findIndex(g => g.id === state.group);
    const next = (i + (e.key === 'ArrowRight' ? 1 : GROUPS.length - 1)) % GROUPS.length;
    state.group = GROUPS[next].id;
    renderTabs(); renderChips(); refreshAll();
    el.tabs.querySelectorAll('.tab')[next].focus();
  });

  document.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (chip) {
      const { budget, avoid, badge, fav } = chip.dataset;
      if (budget) state.budget = budget;
      if (avoid) state.avoid.has(avoid) ? state.avoid.delete(avoid) : state.avoid.add(avoid);
      if (badge) state.badges.has(badge) ? state.badges.delete(badge) : state.badges.add(badge);
      if (fav) { toggleFavOnly(); return; }
      renderChips(); refreshAll();
      return;
    }

    const sort = e.target.closest('.sort');
    if (sort) { state.sort = sort.dataset.sort; renderChips(); renderList(); return; }

    const eat = e.target.closest('[data-eat]');
    if (eat) {
      const d = BY_ID.get(eat.dataset.eat);
      toast(`${d.emoji} ${d.name} · ¥${d.price} · ${d.shop} —— 已记入「今天要吃」`);
      return;
    }

    const f = e.target.closest('[data-fav-id]');
    if (f) {
      const id = f.dataset.favId;
      state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
      saveFavs();
      const d = BY_ID.get(id);
      toast(state.favs.has(id) ? `♥ 已收藏「${d.name}」` : `已取消收藏「${d.name}」`);
      renderChips(); renderList(); renderResult(state.lastDish ? BY_ID.get(state.lastDish) : null);
      updateFavCount();
      if (state.lastDish) el.revealCard.classList.add('is-flipped');
      return;
    }

    if (e.target.closest('#againBtn')) { spin(); return; }
    const card = e.target.closest('.reveal');
    if (card && !state.lastDish) spin();
  });

  function toggleFavOnly() {
    state.favOnly = !state.favOnly;
    toast(state.favOnly ? (state.favs.size ? '已切换为只看收藏' : '还没有收藏任何菜品 ♥') : '已恢复全部菜品');
    renderChips();
    refreshAll();
  }

  el.spinBtn.addEventListener('click', spin);
  el.favCount.addEventListener('click', toggleFavOnly);
  el.reshuffle.addEventListener('click', () => { buildWheel(); toast('已换一批签位 🎲'); });
  el.resetFilter.addEventListener('click', () => {
    state.budget = 'any'; state.avoid.clear(); state.badges.clear(); state.favOnly = false;
    renderChips(); refreshAll(); toast('条件已重置');
  });

  /* ---------------- 10. 顶栏与提示 ---------------- */

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.toast.classList.remove('is-on'), 2400);
  }

  function updateFavCount() {
    el.favCount.textContent = `♥ 收藏 ${state.favs.size}`;
    el.favCount.classList.toggle('is-on', state.favOnly);
  }

  function tickClock() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    el.clock.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const slot = h >= 5 && h < 10 ? '早餐' : h >= 10 && h < 15 ? '午餐' : h >= 15 && h < 17 ? '下午茶' : h >= 17 && h < 21 ? '晚餐' : '夜宵';
    el.mealSlot.textContent = slot + '时间';
  }

  function refreshAll() {
    const pool = candidates();
    if (pool.length === 0) el.revealCard.classList.remove('is-flipped');
    buildWheel();
    renderList();
    renderBoards();
    updateFavCount();
  }

  /* ---------------- 11. 启动 ---------------- */
  renderTabs();
  renderChips();
  refreshAll();
  renderResult(null);
  tickClock();
  setInterval(tickClock, 20000);
  window.addEventListener('resize', movePill);
  setTimeout(() => { const w = $('.wheel-wrap'); if (w) w.classList.add('is-ready'); }, 400);
})();
