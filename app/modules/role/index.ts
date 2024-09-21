export const transformPermissions = (permissions: any) => {
  const response = permissions.map((permission: any) => ({
    id: permission.permission.id,
    name: permission.permission.name,
    category: permission.permission.category,
  }))
  return response
}
