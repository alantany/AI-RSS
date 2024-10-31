class ProxyPool {
  constructor() {
    this.proxies = [
      // 添加你的代理服务器列表
      // 'http://proxy1.example.com:8080',
      // 'http://proxy2.example.com:8080'
    ];
    this.currentIndex = 0;
  }

  getProxy() {
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }
}

module.exports = new ProxyPool(); 