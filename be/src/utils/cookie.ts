import { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const customerCookieOptions: CookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction ? "none" : "lax",

  domain: isProduction ? ".spaclinic.online" : undefined,

  path: "/",

  maxAge: 1000 * 60 * 60 * 24,
};

export const staffCookieOptions: CookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction ? "none" : "lax",

  domain: isProduction ? ".spaclinic.online" : undefined,

  path: "/",

  maxAge: 1000 * 60 * 60 * 24,
};