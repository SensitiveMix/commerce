```bash
                                                                                                      _           _      __
                                                                                                     | |         | |    / _|
   ___   ______    ___    ___    _ __ ___    _ __ ___     ___   _ __    ___    ___   ______   _ __   | |   __ _  | |_  | |_    ___    _ __   _ __ ___
  / _ \ |______|  / __|  / _ \  | '_ ` _ \  | '_ ` _ \   / _ \ | '__|  / __|  / _ \ |______| | '_ \  | |  / _` | | __| |  _|  / _ \  | '__| | '_ ` _ \
 |  __/          | (__  | (_) | | | | | | | | | | | | | |  __/ | |    | (__  |  __/          | |_) | | | | (_| | | |_  | |   | (_) | | |    | | | | | |
  \___|           \___|  \___/  |_| |_| |_| |_| |_| |_|  \___| |_|     \___|  \___|          | .__/  |_|  \__,_|  \__| |_|    \___/  |_|    |_| |_| |_|
                                                                                             | |
                                                                                             |_|

```

![Build Status](https://travis-ci.org/sunNode/commerce.svg?branch=master)
[![codecov](https://codecov.io/gh/sunNode/commerce/branch/master/graph/badge.svg)](https://codecov.io/gh/sunNode/commerce)


## Installation
    git clone https://bitbucket.org/wechatpla/master.git


## Install dependencies:
    npm install

## Start the server:

```bash

dev serve       : npm run dev        //后端用的，前端也可以用这个但是前端改动会重启服务器，然后刷新浏览器

```

```bash

browser serve   : npm run browsersync  //给前端用的，现在前端改动了直接保存，页面会自动刷新

```

```bash

product serve   : npm run production   //开发部署用的

```

```bash

manual package  : npm run build      //页面不停跳转的时间，打开public，删除public——js-build&&public-css-build，跑一下这个命令

```



## run test

* npm test

## run test-cov

* npm run-script test-cov

