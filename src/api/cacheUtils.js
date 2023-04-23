// cacheUtils.js
export const CacheUtils = {
	// 存储请求接口地址以及请求体和取消函数之间的映射关系
	cache: {},

	// 根据提供的键名 key 取消对应的请求，若未提供则取消全部请求
	clearCache: function (key) {
		if (key) {
			const cancel = this.cache[key];
			if (cancel && typeof cancel === 'function') {
				cancel();
				delete this.cache[key];
			}
			return;
		}

		Object.keys(this.cache).forEach(cacheKey => {
			const cancel = this.cache[cacheKey];
			cancel();
			delete this.cache[cacheKey];
		});
	},
};
