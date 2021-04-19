const api_key = 'hfbY2wLXQQBtmpGADjRmSpSdHFnHSmFl';

const toRequestParams = obj =>
  Object.keys(obj)
    .reduce(
      (queryParams, key) => [
        ...queryParams,
        `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`,
      ],
      [],
    )
    .join('&');

const request = (endpoint, params) =>
  fetch(
    [
      `https://api.giphy.com/v1${endpoint}`,
      toRequestParams({ ...params, api_key }),
    ].join('?'),
  ).then(response => response.json());

export const searchGifs = q =>
  request('/gifs/search', {
    q,
    limit: 5,
    rating: 'g',
    lang: 'en',
  });
