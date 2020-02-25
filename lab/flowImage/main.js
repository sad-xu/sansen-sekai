
// 1. 加载图片，分割为n个小方格
// 2. 计算每个小方格的亮度值
// 3. 画出从左至右移动的粒子
// 4. 根据每个小方格的亮度值调整在其中运动的粒子的速度
// 5. 根据粒子的速度设置其显隐
// 6. 让粒子延时消失

const canvas = document.getElementById('c')
const ctx = c.getContext('2d')
const WIDTH = canvas.width
const HEIGHT = canvas.height

// 加载图片
async function loadImg(url) {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

async function setp1() {
  let image = await loadImg('')
  ctx.drawImage(image)
  let imgData = ctx.geyImageData(0, 0, WIDTH, HEIGHT).data
  let ret = []
  for (let i = 0; i < imgData.length; i += 4) {
    ret.push()
  }
}

