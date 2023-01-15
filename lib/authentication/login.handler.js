"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getLoginPath = (admin) => {
  const { loginPath, rootPath } = admin.options;
  // since we are inside already namespaced router we have to replace login and logout routes that
  // they don't have rootUrl inside. So changing /admin/login to just /login.
  // but there is a case where user gives / as a root url and /login becomes `login`. We have to
  // fix it by adding / in front of the route
  const normalizedLoginPath = loginPath.replace(rootPath, "");
  return normalizedLoginPath.startsWith("/")
    ? normalizedLoginPath
    : `/${normalizedLoginPath}`;
};
class Retry {
  constructor(ip) {
    this.retriesCount = 0;
    const existing = Retry.retriesContainer.get(ip);
    if (existing) {
      return existing;
    }
    Retry.retriesContainer.set(ip, this);
  }
  canLogin(maxRetries) {
    if (maxRetries === undefined) {
      return true;
    } else if (typeof maxRetries === "number") {
      maxRetries = {
        count: maxRetries,
        duration: 60,
      };
    } else if (maxRetries.count <= 0) {
      return true;
    }
    if (
      !this.lastRetry ||
      new Date().getTime() - this.lastRetry.getTime() >
        maxRetries.duration * 1000
    ) {
      this.lastRetry = new Date();
      this.retriesCount = 1;
      return true;
    } else {
      this.lastRetry = new Date();
      this.retriesCount++;
      return this.retriesCount <= maxRetries.count;
    }
  }
}
Retry.retriesContainer = new Map();
const withLogin = (router, admin, auth) => {
  const { rootPath } = admin.options;
  const loginPath = getLoginPath(admin);
  router.get(loginPath, async (req, res) => {
    //redirect to our authclient page
    let _url = req.protocol + "://" + req.get("Host");
    // if (!_url.includes("localhost")) {
    //   _url = "https://hiasia.link";
    // }
    console.log("redirect to authclient", _url);
    res.redirect(302, _url + "/authclient");
  });
  router.post(loginPath, async (req, res, next) => {
    if (!new Retry(req.ip).canLogin(auth.maxRetries)) {
      const login = await admin.renderLogin({
        action: admin.options.loginPath,
        errorMessage: "tooManyRequests",
      });
      res.send(login);
      return;
    }
    const { id_token, access_token } = req.fields;
    const adminUser = await auth.authenticate(id_token, access_token);
    if (adminUser) {
      req.session.adminUser = adminUser;
      req.session.save((err) => {
        if (err) {
          next(err);
        }
        if (req.session.redirectTo) {
          res.redirect(302, req.session.redirectTo);
        } else {
          res.redirect(302, rootPath);
        }
      });
    } else {
      let _url = req.protocol + "://" + req.get("Host");
      // if (!_url.includes("localhost")) {
      //   _url = "https://hiasia.link";
      // }
      res.redirect(302, _url + "/authclient?msg=wrong_token");
    }
  });
};
exports.withLogin = withLogin;
//# sourceMappingURL=login.handler.js.map
