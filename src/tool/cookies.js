import cookies from "react-cookies";

const token = "identitytoken";
const user = "userName";
const userId = "userId";
const host = "serverHost";

// 存储token
export function setToken(value) {
	cookies.save(token, value);
}
export function getToken() {
	return cookies.load(token);
}

// 存储用户名
export function setUsername(value) {
	cookies.save(user, value);
}

export function getUsername() {
	return decodeURIComponent(cookies.load(user));
}

//存储用户Id
export function setUserId(value) {
	cookies.save(userId, value);
}
export function getUserId() {
	return cookies.load(userId);
}

//存储host
export function setHost(value) {
	cookies.save(host, value);
}
export function getHost() {
	return cookies.load(host);
}

// 清除
export function removeToken() {
	cookies.remove(token);
}
export function removeUsername() {
	cookies.remove(user);
}

export function removeUserId() {
	cookies.remove(userId);
}

export function removeHost() {
	cookies.remove(host);
}

//存储所有
export const saveAll = (token, user, userId) => {
setToken(token)
setUsername(user)
setUserId(userId)
}

export const clearAll = () => {
	removeToken()
	removeUsername()
	removeUserId()
}