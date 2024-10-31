interface UserPayload {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role_id: number
  avatar?: string
}

interface ClientPayload {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  state: string
  country: string
  address: string
  company?: string
  avatar?: string
}
