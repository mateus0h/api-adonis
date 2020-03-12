'use strict'
const { isBefore, addDays } = require('date-fns')
const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')

      const user = await User.findBy('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(['emails.forgot_password'], {
        email,
        token: user.token,
        link: `${request.input('redirect_url')}?token=${user.token}`
      },
      message => {
        message
          .to(user.email)
          .from('mateus@gmail.com', 'Mateus | Matdevs')
          .subject('Recumperação de senha')
      })
    } catch (err) {
      return response
        .status(500)
        .send({
          error: {
            message: 'Algo não deu certo, esse email existe ?'
          }
        })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      const tokenExpired = isBefore(addDays(user.token_created_at, 2), new Date())
      if (tokenExpired) {
        return response
          .status(401)
          .send({
            error: {
              message: 'Token de recumperação esta expirado'
            }
          })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()
    } catch (err) {
      return response
        .status(500)
        .send({
          error: {
            message: 'Algo deu errado ao resetar sua senha'
          }
        })
    }
  }
}

module.exports = ForgotPasswordController
