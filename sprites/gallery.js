const ASSETS = [
  ['SHOOTER', '单词射手'], ['REPEATER', '双发词霸'], ['WALL', '坚果盾'], ['ICE', '冷笑话手'], ['THISTLE', '导向蓟'],
  ['NORMAL', '普通僵尸'], ['CONE', '路障僵尸'], ['BUCKET', '铁桶僵尸'], ['BOSS', '首领僵尸'], ['GIANT', '巨人僵尸'],
  ['pea', '豌豆'], ['ice_pea', '冰豌豆'], ['thorn', '追踪尖刺'],
];
const actionLabels = { idle: '待机', walk: '行走', attack: '攻击', defend: '防御', die: '死亡', spin: '旋转' };
const $ = id => document.getElementById(id);
const play = $('play'), speed = $('speed'), frozen = $('frozen'), scrub = $('scrub'), grid = $('grid');
let paused = false, scrubFrame = null;

async function start() {
  const read = async file => {
    const response = await fetch(file);
    if (!response.ok) throw new Error(file + ': HTTP ' + response.status);
    return response.json();
  };
  const [atlas, animation] = await Promise.all([read('./manifest.json'), read('./animations.json')]);
  const cards = ASSETS.map(([name, label]) => {
    const asset = atlas.find(a => a.name === name);
    const clips = animation.characters[name];
    const card = document.createElement('article');
    card.className = 'card ' + asset.file.split('/')[0];
    card.dataset.name = name;
    card.innerHTML = '<div class="stage"><canvas width="96" height="96" aria-label="' + label + '"></canvas></div>'
      + '<div class="meta"><div class="title"><h2>' + label + '</h2><span class="id">' + name + '</span></div>'
      + '<div class="controls"><select aria-label="' + label + '动画">' + Object.keys(clips)
        .map(key => '<option value="' + key + '">' + actionLabels[key] + '</option>').join('')
      + '</select><span class="frame"></span></div></div>';
    grid.append(card);
    const canvas = card.querySelector('canvas'), select = card.querySelector('select'), display = card.querySelector('.frame');
    const img = new Image();
    img.onerror = () => { card.classList.add('error'); display.textContent = '加载失败'; };
    img.src = asset.file;
    const model = { asset, clips, card, canvas, ctx: canvas.getContext('2d'), display, img, select, ticks: 0, drawn: -1 };
    select.onchange = () => { model.ticks = 0; scrubFrame = null; updateScrub(); };
    return model;
  });

  function updateScrub() {
    scrub.max = Math.max(...cards.map(c => c.clips[c.select.value].frames.length)) - 1;
    scrub.value = scrubFrame ?? 0;
  }

  function setPaused(value) {
    paused = value;
    play.textContent = value ? '播放动画' : '暂停动画';
  }

  play.onclick = () => {
    if (paused && scrubFrame !== null) {
      for (const c of cards) c.ticks = c.clips[c.select.value].ticks.slice(0, scrubFrame).reduce((a, b) => a + b, 0);
      scrubFrame = null;
    }
    setPaused(!paused);
  };
  scrub.oninput = () => { scrubFrame = Number(scrub.value); setPaused(true); };
  for (const button of document.querySelectorAll('[data-mode]')) button.onclick = () => {
    for (const b of document.querySelectorAll('[data-mode]')) b.classList.toggle('active', b === button);
    const mode = button.dataset.mode;
    for (const c of cards) {
      c.select.value = c.clips[mode] ? mode
        : mode === 'attack' && c.clips.defend ? 'defend' : c.select.options[0].value;
      c.ticks = 0;
    }
    scrubFrame = null;
    updateScrub();
  };
  updateScrub();

  let last = performance.now();
  function render(now) {
    const delta = Math.min(100, now - last) / 1000 * animation.tickHz * Number(speed.value);
    last = now;
    for (const c of cards) {
      if (!c.img.complete || !c.img.naturalWidth) continue;
      const action = c.select.value, clip = c.clips[action], count = clip.frames.length;
      const total = clip.ticks.reduce((a, b) => a + b, 0);
      const isFrozen = frozen.checked && c.asset.file.startsWith('zombies/');
      if (!paused) {
        const next = c.ticks + delta * (isFrozen && action === 'walk' ? 0.5 : 1);
        c.ticks = clip.loop ? next % total : Math.min(next, total);
      }
      let remaining = c.ticks, position = 0;
      while (position < count - 1 && remaining >= clip.ticks[position]) remaining -= clip.ticks[position++];
      if (scrubFrame !== null) position = Math.min(scrubFrame, count - 1);
      const frame = clip.frames[position];
      if (c.drawn !== frame) {
        c.ctx.imageSmoothingEnabled = false;
        c.ctx.clearRect(0, 0, 96, 96);
        c.ctx.drawImage(c.img, frame % c.asset.columns * 96, Math.floor(frame / c.asset.columns) * 96, 96, 96, 0, 0, 96, 96);
        c.drawn = frame;
      }
      c.card.dataset.action = action;
      c.card.dataset.frame = position;
      c.display.textContent = (position + 1) + ' / ' + count;
      c.canvas.style.filter = isFrozen ? 'brightness(1.25) saturate(.5) hue-rotate(30deg)' : '';
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

start().catch(error => {
  console.error(error);
  grid.textContent = '图册加载失败。请通过项目的本地服务器打开。';
});
