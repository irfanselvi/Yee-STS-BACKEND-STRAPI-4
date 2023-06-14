module.exports = {
    routes: [
       {
          "method": "POST",
          "path": "/auth/forgot-password",
          "handler": "forgot-pass-token.forgotPassword"
       },
       {
           "method": "POST",
           "path": "/auth/token-verify",
           "handler": "forgot-pass-token.tokenVerify"
        },
        {
           "method": "POST",
           "path": "/auth/reset-password",
           "handler": "forgot-pass-token.resetPassword"
        }
    ]
  }
  