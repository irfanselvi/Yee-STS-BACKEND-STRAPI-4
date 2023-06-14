'use strict';

const bcrypt = require('bcrypt');

const { sanitize } = require('@strapi/utils');
const nodemailer = require('nodemailer');
const { PasswordResetMailContent } = require('../../../utils/email');
const userEmail = 'stsdestek@yee.org.tr';
const userPass = 'viqzin-zezbep-Succa5';
// Create reusable transporter object using SMTP transport.
const transporter = nodemailer.createTransport({
    service: "Exchange",
    host: "exchange.yee.org.tr",
    // port: 587,
    // secure: true, // TLS kullanmak için "secure" özelliğini true olarak ayarlayın
    auth: {
        user: userEmail,
        pass: userPass,
    },
});

const formatError = error => [
    { messages: [{ id: error.id, message: error.message, field: error.field }] },
];


const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::forgot-pass-token.forgot-pass-token', ({ strapi }) => ({
    forgotPassword: async ctx => {
        const params = ctx.request.body;
        if (!params.email) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.email.provide',
                    message: 'E-posta Girilmesi Gerekli.',
                })
            );
        }

        const user = await strapi.query('plugin::users-permissions.user').findOne({ where :{email: params.email} });
        console.log(user)
        if (!user) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.email.provide',
                    message: 'E-posta Kaydı Bulunamadı.',
                })
            );
        }
        // console.log(strapi.plugins['users-permissions'].services.jwt)
        const newJwt = strapi.plugins['users-permissions'].services.jwt.issue({
            id: user.id
        })
        const passwordToken = await strapi.query('api::forgot-pass-token.forgot-pass-token').findOne({ where :{user: user.id}, populate: true });

        const now = new Date();
        const tokenExpiration = 3 * 60 * 1000; // 3 dakika (milisaniye cinsinden)
        
       

        let newToken;
        if (!passwordToken) {
            const dt = {
                token: newJwt,
                user: user.id
            }
            newToken = await strapi.entityService.create('api::forgot-pass-token.forgot-pass-token', {data: dt});
            // newToken = await strapi.query('api::forgot-pass-token.forgot-pass-token').create(dt);
        } else {
            if ((now - new Date(passwordToken.updatedAt)) < tokenExpiration) {
                return ctx.badRequest(
                    null,
                    formatError({
                        id: 'Auth.form.error.email.provide',
                        message: 'Lütfen Şifre Sıfırlama Taleplerini Tekrar Göndermeden Önce Biraz Bekleyin.',
                    })
                );
            }
            const dt = {
                token: newJwt,
                user: user.id
            }
            newToken = await strapi.entityService.update('api::forgot-pass-token.forgot-pass-token', passwordToken.id, {data: dt});
            // newToken = await strapi.services['forgot-pass-token'].update({ id: passwordToken.id }, dt);
        }
        let newContent = PasswordResetMailContent().toString();
        
        newContent = newContent.replace("{{fullname}}", `${user.username}`)
        newContent = newContent.replace("{{link}}", `${'https://ststest.yee.org.tr'}/auth/sifre-reset/${newToken.token}`)
        const options = {
            from: userEmail,
            to: user.email,
            subject: 'Şifre Sıfırlama Talebi',
            // text: newToken.token,
            html: newContent,
        };
        // Return a promise of the function that sends the email. 
        await transporter.sendMail(options);
        let response = {
            status: true,
            message: "Başarıyla Sıfırlama Kodu Gönderildi.",
            // data: {
            //     token: newToken.token,
            // }
        }
        const sanitizedEntity = await sanitize.contentAPI.output(response);
        return sanitizedEntity;
        // return { data: sanitizedEntity };
        // return sanitizeEntity(response, { model: strapi.query('user', 'users-permissions').model, });
    },
    tokenVerify: async ctx => { 
        const params = ctx.request.body;
        if (!params.token) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.email.provide',
                    message: 'Token Bilgisi Yok',
                })
            );
        }
        const passwordToken = await strapi.query('api::forgot-pass-token.forgot-pass-token').findOne({ where :{token: params.token} });
        // const passwordToken = await strapi.services['forgot-pass-token'].findOne({ token: params.token });
        const now = new Date();
        const tokenExpiration = 3 * 60 * 1000; // 3 dakika (milisaniye cinsinden)
        
        if (!passwordToken || (now - passwordToken.updatedAt) > tokenExpiration) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.email.provide',
                    message: 'Token Bilgisi Geçersiz veya Süresi Dolmuş',
                })
            );
        }

        let response = {
            status: true,
            message: "Token Geçerli",
        }
        const sanitizedEntity = await sanitize.contentAPI.output(response);
        return sanitizedEntity;
        // return { data: sanitizedEntity };
        // return sanitizeEntity(response, { model: strapi.query('user', 'users-permissions').model, });
    },
    resetPassword: async ctx => {
        // const params = JSON.parse(ctx.request.body);
        const params = ctx.request.body;
        if (!params.token) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.email.provide',
                    message: 'Token Bilgisi Yok',
                })
            );
        }
    
        
        const passwordToken = await strapi.query('api::forgot-pass-token.forgot-pass-token').findOne({ where : {token: params.token }, populate: true});
        // const passwordToken = await strapi.services['forgot-pass-token'].findOne({ token: params.token });
        const now = new Date();
        const tokenExpiration = 3 * 60 * 1000; // 3 dakika (milisaniye cinsinden)
        
        if (!passwordToken || (now - passwordToken.updatedAt) > tokenExpiration) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.email.provide',
                    message: 'Token Bilgisi Geçersiz veya Süresi Dolmuş',
                })
            );
        }
        // The new password is required.
        if (!params.newPassword) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.password.provide',
                    message: 'Please provide your new password.',
                })
            );
        }

        // The new password confirmation is required.
        if (!params.confirmPassword) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.password.provide',
                    message: 'Lütfen yeni şifrenizi tekrar girin.',
                })
            );
        }

        if (
            params.newPassword &&
            params.confirmPassword &&
            params.newPassword !== params.confirmPassword
        ) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.password.matching',
                    message: 'Şifreler Eşleşmiyor',
                })
            );
        } else if (
            params.newPassword &&
            params.confirmPassword &&
            params.newPassword === params.confirmPassword
        ) {
            // Get User based on identifier
            // const user = await strapi.query('user', 'users-permissions').findOne({ id: passwordToken.user });
            console.log(passwordToken.user.id)
            const user = await strapi.query('plugin::users-permissions.user').findOne({ where :{id: passwordToken.user.id} });
       

            // Validate given password against user query result password
            // console.log(strapi.plugins['users-permissions'].services.user)
            // const password = await strapi.plugins['users-permissions'].services.user.hashPassword({
            //     password: params.newPassword,
            // });

            const password = bcrypt.hashSync(params.newPassword, 10);
            // const password = await strapi.plugins[("user", "users-permissions")].services.user.hashPassword({
            //     password: params.newPassword,
            //   });
            // Update user password
            // const newCont = await strapi.plugins['users-permissions'].services['users-permissions'].getActions();
            // console.log(newCont['plugin::users-permissions'].controllers.user)
            // // await strapi.entityService.update('plugin::users-permissions.user', {id: user.id}, {data: { resetPasswordToken: null, password: password }});

            // await strapi.entityService.update(
            //     "plugin::users-permissions.user",
            //     user.id,
            //     {
            //       data: { resetPasswordToken: null, password: password }
            //     }
            //   );
            await strapi.db.query('plugin::users-permissions.user').update({
                where: { id: user.id },
                data: { resetPasswordToken: null, password: password }
              });

            await strapi.entityService.delete('api::forgot-pass-token.forgot-pass-token',passwordToken.id);
            // Return new jwt token
            const sanitizedEntity = await sanitize.contentAPI.output(user.toJSON ? user.toJSON() : user);

            ctx.send({
                jwt: strapi.plugins['users-permissions'].services.jwt.issue({
                    id: user.id,
                }),
                user: sanitizedEntity,
            });
        }
        
    }
}));
