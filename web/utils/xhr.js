import types from "./types.js";

const tasks = [];

function normalizeOptions(options) {
    let form = new FormData();
    return {
        method: types.string(options.method),
        url: ((url, query) => {
            return Object.keys(query).forEach((key) => {
                let value = key.length > 0 ? query[key] : null;
                if (!types.isString(value) && !types.isNumber(value)) value = null;
                if (value !== null) url.searchParams.set(key, value);
            }), url.toString();
        })(new URL(types.string(options.url)), types.object(options.query)),
        headers: ((headers) => {
            return Object.keys(headers).reduce((list, key) => {
                let value = key.length > 0 ? headers[key] : null;
                if (!types.isString(value) && !types.isNumber(value)) value = null;
                if (value !== null) list.push([key, value]);
                return list;
            }, []);
        })(types.object(options.headers)),
        credentials: types.bool(options.credentials),
        body: types.isFunction(options.body) ? options.body() : ((body, count) => {
            let form = Object.keys(body).reduce((form, key) => {
                let value = key.length > 0 ? body[key] : null;
                if (!types.isString(value) && !types.isNumber(value)) value = null;
                if (value !== null) count++, form.set(key, value);
                return form;
            }, new FormData());
            return count > 0 ? form : null;
        })(types.object(options.body), 0),
        progress: types.isFunction(options.progress) ? options.progress : null,
        responseType: types.string(options.responseType),
        timeout: types.int(options.timeout),
        callback: types.func(options.callback),
    };
}

function createInst(options) {
    let [inst, opts] = [new XMLHttpRequest(), normalizeOptions(options)];
    inst.open(opts.method, opts.url, true);
    opts.headers.forEach((header) => inst.setRequestHeader(...header));
    inst.withCredentials = opts.credentials;
    inst.upload.onprogress = opts.progress ? (e) => opts.progress({
        type: "upload",
        total: e.total,
        loaded: e.loaded,
        percent: Math.min(Math.floor(e.loaded / Math.max(e.total, 1) * 100), 100),
    }) : null;
    inst.responseType = opts.responseType;
    inst.timeout = opts.timeout;
    inst.onreadystatechange = () => inst.readyState === 4 && inst.status !== 0 && inst.destroy() && opts.callback({
        status: inst.status,
        statusText: inst.statusText || "服务器异常",
        data: inst.response,
    });
    inst.onabort = () => inst.destroy() && opts.callback({
        status: -1,
        statusText: "请求中断",
    });
    inst.ontimeout = () => inst.destroy() && opts.callback({
        status: 500,
        statusText: "请求超时",
    });
    inst.onerror = () => inst.destroy() && opts.callback({
        status: 500,
        statusText: "网络或服务器异常",
    });
    inst.onprogress = opts.progress ? (e) => opts.progress({
        type: "download",
        total: e.total,
        loaded: e.loaded,
        percent: Math.min(Math.floor(e.loaded / Math.max(e.total, 1) * 100), 100),
    }) : null;
    inst.destroy = () => {
        let index = tasks.indexOf(inst);
        if (index > -1) tasks.splice(index, 1);
        return inst.readyState !== 4 && inst.abort(), true;
    };
    inst.send(opts.body);
    tasks.push(inst);
}

export default {
    prefix: "",
    options: {},
    post(url, body, options) {
        return types.promise((resolve) => createInst({
            ...this.options,
            method: "POST",
            url: /^https?:\/\/\S+$/i.test(url) ? url : this.prefix + url,
            body: body,
            query: {},
            ...types.object(options),
            callback: resolve,
        }));
    },
    get(url, query, options) {
        return types.promise((resolve) => createInst({
            ...this.options,
            method: "POST",
            url: /^https?:\/\/\S+$/i.test(url) ? url : this.prefix + url,
            body: {},
            query: query,
            ...types.object(options),
            callback: resolve,
        }));
    },
    abort() {
        tasks.splice(0).forEach((inst) => inst.destroy());
    },
};