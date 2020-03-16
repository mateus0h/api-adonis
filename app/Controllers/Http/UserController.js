'use strict'

const Database = use('Database')
const User = use('App/Models/User')
const UserAddress = use('App/Models/UserAddress')

class UserController {
  async store ({ request }) {
    const { permissions, roles, ...data } = request
      .only([
        'username',
        'email',
        'password',
        'permissions',
        'roles'
      ])

    const addresses = request.input('addresses')

    const trx = await Database.beginTransaction()

    const user = await User.create(data, trx)

    await user.addresses().createMany(addresses, trx)

    await trx.commit()

    if (roles) {
      await user.roles().attach(roles)
    }

    if (permissions) {
      await user.permissions().attach(permissions)
    }

    await user.loadMany(['roles', 'permissions'])

    return user
  }

  async update ({ request, params }) {
    const { permissions, roles, ...data } = request
      .only([
        'username',
        'email',
        'password',
        'permissions',
        'roles'
      ])

    // const { ...addresses } = request.input('addresses')

    const trx = await Database.beginTransaction()

    const user = await User.findOrFail(params.id, trx)
    // const userAddress = await UserAddress.query()
    //   .where({ user_id: params.id })
    //   .fetch(trx)

    // userAddress.merge(addresses)
    // await userAddress.save()

    user.merge(data)
    await user.save()

    await trx.commit()

    if (roles) {
      await user.roles().sync(roles)
    }

    if (permissions) {
      await user.permissions().sync(permissions)
    }

    await user.loadMany(['roles', 'permissions'])

    return user
  }
}

module.exports = UserController
