
if ('registerProperty' in CSS) {
  // polygon
  CSS.registerProperty({
    name: '--polygon-angle',
    syntax: '<angle>',
    initialValue: '0deg',
    inherits: false
  })
  CSS.registerProperty({
    name: '--polygon-sides',
    syntax: '<integer>',
    initialValue: '4',
    inherits: false
  })
} else {
  console.log('Not support registerProperty!')
}

if ('paintWorklet' in CSS) {
  CSS.paintWorklet.addModule('./paint.js').then(() => {
    console.log('Paint script installed!')
  })
} else {
  console.log('Not support paintWorklet!')
}
