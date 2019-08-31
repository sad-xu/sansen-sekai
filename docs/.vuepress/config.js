module.exports = {
  title: 'Sansen Sekai',
  description: '三千世界, 学无止境',
  // serviceWorker: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@alias': '/'
      }
    }
  },
  themeConfig: {
    lastUpdated: '修改于',
    nav: [
      { text: '基础知识', link: '/base/' },
      { text: '算法解析', link: '/algorithm/' },
      { text: '前端周刊', link: '/weekly/' },
      { text: 'GitHub', link: 'https://github.com/sad-xu'}
    ],
    sidebar: {
      '/base/': [
        '',
      ],
      '/algorithm/': [
        ''
      ],
      '/weekly/': [
        ''
      ]
    }
  }
}
