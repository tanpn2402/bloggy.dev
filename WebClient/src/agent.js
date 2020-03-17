import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
import { API_URL } from './constants/constants';

const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = API_URL + '/api';

const encode = encodeURIComponent;
const responseBody = res => res.body;

let token = null;
const tokenPlugin = req => {
    if (token) {
        req.set('authorization', `Token ${token}`);
    }
}

const requests = {
    del: url =>
        superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
    get: url =>
        superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
    put: (url, body) =>
        superagent.put(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
    post: (url, body) =>
        superagent.post(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody)
};

const Auth = {
    current: () =>
        requests.get('/user'),
    login: (email, password) =>
        requests.post('/users/login', { user: { email, password } }),
    register: (username, email, password) =>
        requests.post('/users', { user: { username, email, password } }),
    save: user =>
        requests.put('/user', { user })
};

const Tags = {
    getAll: () => requests.get('/tags')
};

const limit = (count, p) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = data => Object.assign({}, data, { slug: undefined });

const Articles = {
    all: page =>
        requests.get(`/articles?${limit(10, page)}`),
    byAuthor: (author, page) =>
        requests.get(`/articles?author=${encode(author)}&${limit(5, page)}`),
    byTag: (tag, page) =>
        requests.get(`/articles?tag=${encode(tag)}&${limit(10, page)}`),
    bySpace: (space, page) =>
        requests.get(`/articles?space=${encode(space)}&${limit(10, page)}`),
    del: slug =>
        requests.del(`/articles/${slug}`),
    favorite: slug =>
        requests.post(`/articles/${slug}/favorite`),
    favoritedBy: (author, page) =>
        requests.get(`/articles?favorited=${encode(author)}&${limit(5, page)}`),
    feed: () =>
        requests.get('/articles/feed?limit=10&offset=0'),
    get: slug =>
        requests.get(`/articles/${slug}`),
    unfavorite: slug =>
        requests.del(`/articles/${slug}/favorite`),
    update: article =>
        requests.put(`/articles/${article.slug}`, { article: omitSlug(article) }),
    create: article =>
        requests.post('/articles', { article })
};

const Comments = {
    create: (slug, comment) =>
        requests.post(`/articles/${slug}/comments`, { comment }),
    delete: (slug, commentId) =>
        requests.del(`/articles/${slug}/comments/${commentId}`),
    forArticle: slug =>
        requests.get(`/articles/${slug}/comments`)
};

const Profile = {
    follow: username =>
        requests.post(`/profiles/${username}/follow`),
    get: username =>
        requests.get(`/profiles/${username}`),
    unfollow: username =>
        requests.del(`/profiles/${username}/follow`)
};

const Spaces = {
    get: _id =>
        requests.get(`/spaces/${_id}`),
    byAuthor: (author, page) =>
        requests.get(`/spaces?author=${encode(author)}&${limit(5, page)}`),
    byFollowed: (username, page) =>
        requests.get(`/spaces?username=${username}&favourite=1&${limit(5, page)}`),
    update: space =>
        requests.put(`/spaces/${space.slug}`, { space: omitSlug(space) }),
    create: space =>
        requests.post('/spaces', { space })
};

export default {
    Articles,
    Auth,
    Comments,
    Profile,
    Tags,
    Spaces,
    setToken: _token => { token = _token; }
};
