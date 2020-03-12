'use strict'

const Model = use('Model')

const Hash = use('Hash')

class User extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  tokens () {
    return this.hasMany('App/Models/Token')
  }

  projects () {
    return this.belongsTo('App/Models/Project')
  }

  tasks () {
    return this.belongsTo('App/Models/Task')
  }
}

module.exports = User
