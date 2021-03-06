import Vue from "vue";
import VueRouter from "vue-router";

const match = VueRouter.prototype.match;
const push = VueRouter.prototype.push;
const replace = VueRouter.prototype.replace;

VueRouter.prototype.push = function(location, ...args) {
    if (typeof location === "string" && location[0] !== "/") location = {
        name: location,
    };
    let promise = push.call(this, location, ...args);
    return promise instanceof Promise ? promise.catch(() => { }) : promise;
};

VueRouter.prototype.replace = function(location, ...args) {
    if (typeof location === "string" && location[0] !== "/") location = {
        name: location,
    };
    let promise = replace.call(this, location, ...args);
    return promise instanceof Promise ? promise.catch(() => { }) : promise;
};

VueRouter.prototype.match = function(raw, ...args) {
    if (typeof raw === "string" && raw[0] !== "/") raw = {
        name: raw,
    };
    return match.call(this, raw, ...args);
};

VueRouter.prototype.title = function(raw) {
    let route = this.match(raw);
    if (route && !route.redirectedFrom) {
        if (typeof route.meta.title === "string") return route.meta.title;
        try {
            let comp = route.matched[0].components.default;
            if (typeof comp.title === "string") return comp.title;
            if (typeof comp.options.title === "string") return comp.options.title;
        } catch (error) {
            console.error(error.name + ": " + error.message);
        }
    }
    return "";
};

Vue.use(VueRouter);

export default VueRouter;