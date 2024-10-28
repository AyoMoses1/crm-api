import Client from '#models/client'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export const addClient = async (client: ClientPayload, trx: TransactionClientContract) => {
  try {
    const account = await Client.create(
      {
        email: client.email,
        first_name: client.first_name,
        last_name: client.last_name,
        phone_number: client.phone_number,
        address: client.address,
        company: client.company,
        country: client.country,
        state: client.state,
      },
      { client: trx }
    )

    return account
  } catch (error) {
    throw new Error('Account creation failed')
  }
}

export const fetchAllClients = async (page: number, limit: number) => {
  return await Client.query().paginate(page, limit)
}

export const fetchClientById = async (id: number) => {
  return await Client.query().where('id', id).first()
}

export const updateClient = async (clientId: number, payload: any) => {
  const client = await Client.find(clientId)

  if (!client) {
    return null
  }

  client.merge(payload)
  await client.save()

  return client
}
