'use strict'

const Project = use('App/Models/Project')

class ProjectController {
  async index ({ request, auth }) {
    const user = await auth.getUser()

    if (await user.can('read_private_project')) {
      const { page } = request.get()

      const projects = await Project.query()
        .with('user')
        .paginate(page)

      return projects
    }

    const projects = await Project.query().where({ description: 'public' }).fetch()

    return projects
  }

  async store ({ request, auth }) {
    const data = request.only(['title', 'description'])

    const project = await Project.create({
      ...data,
      user_id: auth.user.id
    })

    return project
  }

  async show ({ params }) {
    const project = await Project.findOrFail(params.id)

    await project.load('user')
    await project.load('tasks')

    return project
  }

  async update ({ params, request }) {
    const project = await Project.findOrFail(params.id)
    const data = request.only(['title', 'description'])

    project.merge(data)

    await project.save()

    return project
  }

  async destroy ({ params, request, response }) {
    const project = await Project.findOrFail(params.id)

    await project.delete()
  }
}

module.exports = ProjectController
