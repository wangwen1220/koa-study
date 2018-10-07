// const https = require('https')
const path = require('path')
const Koa = require('koa')
const route = require('koa-route')
const serve = require('koa-static')
const app = new Koa()

// 处理错误
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // console.log('err:', err.statusCode)
    ctx.status = err.statusCode || err.status || 500
    ctx.body = {
      message: err.message
    }
    ctx.app.emit('error', err, ctx)
  }
})

// set x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
  console.log(`X-Response-Time::${ms}`)
})

// logger
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method}::${ctx.url}::${ms}`)
})

// 路由
app.use(route.get('/about', (ctx, next) => {
  // ctx.status = 404
  // ctx.throw(404)
  ctx.body = '<h1>About Page</h1><a href="/">Index Page</a>'
}))
app.use(route.get('/views', (ctx, next) => {
  const n = Number(ctx.cookies.get('view') || 0) + 1
  ctx.cookies.set('view', n)
  ctx.response.body = '查看次数 ' + n
}))
app.use(route.get('/500', (ctx, next) => {
  ctx.throw(500)
}))

// 静态资源
// app.use(serve(path.join(__dirname)))
app.use(serve(path.resolve(__dirname)))

// 原生路由
app.use((ctx, next) => {
  if (ctx.request.path !== '/') {
    ctx.type = 'html'
    ctx.body = '<a href="/">Index Page</a>'
  } else {
    next()
  }
})

// 重定向
app.use((ctx, next) => {
  if (ctx.query.redirect) {
    ctx.status = 301
    ctx.redirect(ctx.query.redirect)
  }
  next()
})

// 新鲜度检查需要状态20x或304
app.use((ctx, next) => {
  // ctx.status = 200
  // ctx.set('ETag', '123')
  ctx.etag = '123'

  // 缓存是新鲜的
  if (ctx.fresh) {
    ctx.status = 304
    return
  }

  next()
})

// TODO: 附件下载
app.use((ctx, next) => {
  if (ctx.query.download) {
    ctx.body = 'Hello Koa'
    response.attachment(ctx.query.download)
  } else {
    next()
  }
})

// next
app.use(async ctx => {
  // ctx.method = 'PUT'
  // ctx.url = '/?test=1#t'
  let data = {
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    ips: ctx.ips,
    host: ctx.host,
    subdomains: ctx.subdomains,
    href: ctx.href,
    originalUrl: ctx.originalUrl,
    path: ctx.path,
    querystring: ctx.querystring,
    query: ctx.query,
    search: ctx.search
  }
  ctx.body = data
  // ctx.body = 'Hello Koa'
  // ctx.throw(400, 'name required')
  // console.log(ctx.req)
})

// 监听错误
app.on('error', err => {
  console.log('logging error::', err.message)
})

// console.log(app)
// console.log(global.process.env)

// https.createServer(app.callback()).listen(3001)
app.listen(3000)
console.log('app started at port 3000...')