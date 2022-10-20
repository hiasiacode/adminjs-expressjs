"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getLogoutPath = (admin) => {
    const { logoutPath, rootPath } = admin.options;
    const normalizedLogoutPath = logoutPath.replace(rootPath, "");
    return normalizedLogoutPath.startsWith("/")
        ? normalizedLogoutPath
        : `/${normalizedLogoutPath}`;
};
const withLogout = (router, admin) => {
    const logoutPath = getLogoutPath(admin);
    router.get(logoutPath, async (request, response) => {
        request.session.destroy(() => {
            response.redirect("/authclient?msg=logout");
        });
    });
};
//# sourceMappingURL=logout.handler.js.map