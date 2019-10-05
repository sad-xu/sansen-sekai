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
            'linked-list/015.反转链表',
            'linked-list/016.合并两个或k个有序链表',
            'linked-list/025.复杂链表的复制',
            'linked-list/036.两个链表的第一个公共结点',
            'linked-list/055.链表中环的入口结点',
            'linked-list/056.删除链表中重复的结点'
          ]
        }, {
          title: '栈和队列',
          children: [
            'stack-queen/005.用两个栈实现队列',
            'stack-queen/020.包含min函数的栈',
            'stack-queen/021.栈的压入、弹出序列',
            'stack-queen/044.翻转单词顺序列(栈)',
            'stack-queen/064.滑动窗口的最大值(双端队列)'
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
