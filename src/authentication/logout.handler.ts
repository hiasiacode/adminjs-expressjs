import AdminJS from "adminjs";
import { Router } from "express";

const getLogoutPath = (admin: AdminJS) => {
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
