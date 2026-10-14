import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8080/api' })

export const getProducts = (search = '') =>
  api.get('/products', { params: search ? { search } : {} }).then(r => r.data)
export const createProduct = product => api.post('/products', product).then(r => r.data)
export const updateProduct = (id, product) => api.put(`/products/${id}`, product).then(r => r.data)
export const deleteProduct = id => api.delete(`/products/${id}`)
