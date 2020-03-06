const http=require("http")
const Path=require("path")
const fs=require("fs")

const mineTypeMap = {
  html: 'text/html;charset=utf-8',
  css: 'text/css;charset=utf-8',
  js: 'application/javascript',
  ico: 'image/x-icon'
}

http.createServer((req,res) => {
  const fileName = Path.resolve(__dirname, "." + req.url)
  const extName = Path.extname(fileName).substr(1)
  
  if (fs.existsSync(fileName)) {
    if (mineTypeMap[extName]) {
      res.setHeader('Content-Type', mineTypeMap[extName])
    }
    let stream = fs.createReadStream(fileName)
    stream.pipe(res)
  }
}).listen(8089)
