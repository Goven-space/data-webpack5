import { get, post } from '@api';

export const getHomeTopStat = params => get('/rest/statistics/analyse/homeTopStat', params);

export const getDataTrend = params => get('/rest/statistics/analyse/dataTrend', params);

export const getSystemStatus = params => get('/rest/statistics/analyse/systemStatus', params, {loading: true});