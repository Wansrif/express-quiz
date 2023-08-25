/* JWT Authentication Middleware Documentation */

/* Description:
 * This module provides middleware functions for JWT token verification and authorization checks.
 * These middleware functions are used to ensure authentication and authorization for specific endpoints.
 */

import jwt from 'jsonwebtoken';

/* ------------------------ */
/* VERIFY TOKEN MIDDLEWARE */
/* ------------------------ */
/* Description:
 * This middleware is used to verify the access token sent by the client.
 * If the token is valid, the user will be added to the request object.
 * If the token is invalid, the request will be rejected with an error response.
 * Endpoints requiring authentication will utilize this middleware.
 */
const verifyToken = async (req, res, next) => {
  try {
    // const token = req.headers.cookie.split('=')[1];
    const token = req.header('x-access-token') || req.cookies.accesstoken;

    if (!token)
      return res.status(401).json({
        status: 'Bad Request',
        status_code: 401,
        message: 'No token provided. Please ensure you have the correct token',
      });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({
          status: 'Forbidden',
          status_code: 403,
          message: 'The provided token is invalid. Please ensure you have the correct token',
        });

      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------------- */
/* VERIFY RESET PASSWORD TOKEN MIDDLEWARE */
/* ----------------------------------------- */
/* Description: */
/* This middleware verifies the reset password token sent by the client.
 * If the token is valid, the user will be added to the request object.
 * If the token is invalid, the request will be rejected with an error response.
 */
const verifyResetPasswordToken = async (req, res, next) => {
  try {
    const token = req.params.token;
    if (!token)
      return res.status(401).json({
        status: 'Bad Request',
        status_code: 401,
        message: 'No token provided. Please ensure you have the correct token',
      });

    jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({
          status: 'Forbidden',
          status_code: 403,
          message: 'The provided token is invalid. Please ensure you have the correct token',
        });

      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* --------------------- */
/* IS ADMIN MIDDLEWARE */
/* --------------------- */
/* Description: */
/* This middleware checks if the user is an admin.
 * If the user is not an admin, the request will be rejected with an error response.
 * Endpoints requiring admin privileges will utilize this middleware.
 */
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({
        status: 'Forbidden',
        status_code: 403,
        message: 'Permission Denied: You do not have the necessary authorization to access this resource',
      });

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* --------------------- */
/* EMAIL VERIFIED MIDDLEWARE */
/* --------------------- */
/* Description: */
/* This middleware checks if the user has verified their email.
 * If the user has not verified their email, the request will be rejected with an error response.
 * Endpoints requiring email verification will utilize this middleware.
 * Note: This middleware should be used after the verifyToken middleware.
 * This middleware will not work if the user is not authenticated.
 * The verifyToken middleware will add the user to the request object.
 */
const emailVerified = async (req, res, next) => {
  try {
    if (!req.user.emailVerified)
      return res.status(403).json({
        status: 'Forbidden',
        status_code: 403,
        message: 'Permission Denied: You do not have the necessary authorization to access this resource',
      });

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const authJwt = {
  verifyToken,
  verifyResetPasswordToken,
  isAdmin,
  emailVerified,
};

export default authJwt;
