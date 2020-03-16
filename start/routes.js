'use strict'

const Route = use('Route')

Route.resource('users', 'UserController')
  .apiOnly()
  .validator('User')
Route.post('sessions', 'SessionController.store').validator('Session')

Route.post('passwords', 'ForgotPasswordController.store').validator('ForgotPassword')
Route.put('passwords', 'ForgotPasswordController.update').validator('ResetPassword')

Route.get('/files/:id', 'FileController.show')

Route.group(() => {
  Route.post('/files', 'FileController.store')

  Route.resource('permissions', 'PermissionController').apiOnly()

  Route.resource('roles', 'RoleController').apiOnly()

  Route.resource('projects', 'ProjectController').apiOnly()
    .validator(new Map(
      [
        [
          ['projects.store'],
          ['Project']
        ]
      ]
    )).except(['index'])

  Route.get('projects', 'ProjectController.index').middleware([
    'auth',
    'can:(read_project || read_private_project)'
  ])

  Route.resource('projects.tasks', 'TaskController')
    .apiOnly()
    .validator(new Map(
      [
        [
          ['projects.tasks.store'],
          ['Task']
        ]
      ]
    ))
}).middleware(['auth'])
