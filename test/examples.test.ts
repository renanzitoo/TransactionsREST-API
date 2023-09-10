import { afterAll, beforeAll, expect, it, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { server } from '../src/app'
import { transcode } from 'node:buffer'

describe ('transaction routes', ()=> {

  beforeAll(async ()=> {
    await server.ready()
  })

  afterAll(async ()=> {
    await server.close()
  })

  beforeEach(async ()=> {
    execSync('npm run knex migrate:rollback --allow')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async()=> {
    await request(server.server)
    .post('/transactions')
    .send({
      title: 'Test transaction',
      amount: 5000,
      type: 'credit'
    }).expect(201)
  })

  it('should be able to list all transactions', async() => {
    const getCookies = await request(server.server)
    .post('/transactions')
    .send({
      title: 'Test transaction',
      amount: 5000,
      type: 'credit',
    })

    const cookies = getCookies.get('Set-Cookie')

    const listTransactionResponse = await request(server.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

      expect(listTransactionResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'Test transaction',
          amount: 5000,
        })
      ])
  })

  it('should be able to get a expecific transaction', async() =>{
    const getCookies = await request(server.server)
    .post('/transactions')
    .send({
      title: 'Test transaction',
      amount: 5000,
      type: 'credit',
    })

    const cookies = getCookies.get('Set-Cookie')

    const listTransactionResponse = await request(server.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
    
    const transactionID = listTransactionResponse.body.transactions[0].id
    
    const getTransactionResponse = await request(server.server)
    .get('/transactions/'.concat(transactionID))
    .set('Cookie', cookies)
    .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Test transaction',
        amount: 5000,
      })
    )
  })
  it('should be able to get a summary', async () => {
    const getCookies = await request(server.server)
    .post('/transactions')
    .send({
      title: 'Credit transaction',
      amount: 5000,
      type: 'credit',
    })

    const cookies = getCookies.get('Set-Cookie')

    await request(server.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send({
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit',
    })

    const summaryResponse = await request(server.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount:3000,
      })
  })

 it('should be able to delete a transaction', async () => {
  const getCookies = await request(server.server)
  .post('/transactions')
  .send({
    title: 'Test transaction',
    amount: 5000,
    type: 'credit',
  })

  const cookies = getCookies.get('Set-Cookie')
  const listTransactionResponse = await request(server.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
    
    const transactionID = listTransactionResponse.body.transactions[0].id
    
    await request(server.server)
    .delete('/transactions/'.concat(transactionID))
    .set('Cookie', cookies)
    .expect(204)
 })

 it('should be able to update a transaction', async ()=> {
  const getCookies = await request(server.server)
  .post('/transactions')
  .send({
    title: 'Test transaction',
    amount: 5000,
    type: 'credit',
  })

  const cookies = getCookies.get('Set-Cookie')
  const listTransactionResponse = await request(server.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
    
  const transactionID = listTransactionResponse.body.transactions[0].id

  await request(server.server)
  .put('/transactions/'.concat(transactionID))
  .set('Cookie', cookies)
  .send({
    title: 'Updated transaction',
    amount: 3000,
    type: 'debit',
  }).expect(204)

 })

})