
// 多边形
registerPaint('polygon', class {
  static get inputProperties() {
    return [
      '--polygon-sides',
      '--polygon-angle'
    ]
  }

  paint(ctx, size, properties) {
    const numSides = properties.get('--polygon-sides').value
    const rotate = properties.get('--polygon-angle').value

    const center = {
      x: size.width / 2,
      y: size.height / 2
    }
    const radius = Math.min(size.width, size.height) / 2
    
    // 移至中点，旋转
    ctx.translate(center.x, center.y)
    ctx.rotate(rotate * Math.PI / 180)
    // 回到左上角
    ctx.translate(-center.x, -center.y)

    ctx.beginPath()

    let xPos = center.x + radius * 1 // cos(0)
    let yPos = center.y + radius * 0 // sin(0)
    ctx.moveTo(xPos, yPos)
    for (let i = 1; i < numSides; i++) {
      xPos = center.x + radius * Math.cos(2 * Math.PI * i / numSides)
      yPos = center.y + radius * Math.sin(2 * Math.PI * i / numSides)
      ctx.lineTo(xPos, yPos)
    }
    ctx.closePath()
    ctx.fill()
  }
})

// 
registerPaint('ripple', class {
  static get inputProperties() { 
    return [
      'background-color', 
      '--ripple-color', 
      '--animation-tick', 
      '--ripple-x', 
      '--ripple-y']; 
  }
  paint(ctx, size, properties) {
    const bgColor = properties.get('background-color').toString();
    const rippleColor = properties.get('--ripple-color').toString();
    const x = parseFloat(properties.get('--ripple-x').toString());
    const y = parseFloat(properties.get('--ripple-y').toString());
    let tick = parseFloat(properties.get('--animation-tick').toString());
    if(tick < 0)
      tick = 0;
    if(tick > 1000)
      tick = 1000;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.fillRect(0, 0, size.width, size.height);

    ctx.fillStyle = rippleColor;
    ctx.globalAlpha = 1 - tick/1000;
    ctx.arc(
      x, y, // center
      size.width * tick/1000, // radius
      0, // startAngle
      2 * Math.PI //endAngle
    );
    ctx.fill();
  }
})