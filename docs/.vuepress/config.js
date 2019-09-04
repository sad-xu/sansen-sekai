module.exports = {
  title: 'Sansen Sekai',
  description: '三千世界, 学无止境',
  // serviceWorker: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@': './public/'
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
        '',
        {
          title: '链表',
          children: [
            'linked-list/003.从头到尾打印链表',
            'linked-list/014.链表中倒数第k个结点',
            'linked-list/015.反转链表'
          ]
        }
      ],
      '/weekly/': [
        '',
        '2019-08-30'
      ],
      '/': [
        ''
      ]
    }
  }
}
