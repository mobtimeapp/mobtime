export default (endpoint, token, options = {}) => {
  const headers = {
    Accept: 'application/json',
    Authorization: `token ${token}`,
  };

  return fetch(endpoint, { ...options, headers });
};
