import React  from 'react'
import ReactDOMServer  from 'react-dom/server'
import Admin  from './ssr/admin'
import manifest  from '../dist/client/manifest'
import path  from 'path'
import Express from 'express'
import SSRTemplate  from './SSRtemplate'
import { getUsers } from './controllers/users.controllers'
import { Provider } from 'react-redux'
import storeFactory from '../client/store'
import { StaticRouter } from 'react-router-dom'
import Login from './ssr/login'
import config from './config';

const middleware = app => {
    app.use(Express.static(path.resolve(__dirname, '../dist/client')))

    app.get('/', (req, res) => {
        res.send(SSRTemplate(
            ReactDOMServer.renderToString(
                <div className="row h-100">
                    <div className="loader"> </div>
                </div>),
            [manifest['vendor.css'], manifest['app.css']],
            [manifest['vendor.js'], manifest['app.js']],
            JSON.stringify(config.apikey)            
        ))
        
    })


    app.get(['/admin', '/admin/*'], (req, res) => getUsers({ query: {} }).then(initialState => {
        res.send(SSRTemplate(
            ReactDOMServer.renderToString(
                <Provider store={storeFactory(initialState)}>
                    <StaticRouter location="/admin" context={{}}>
                        <Admin/>
                    </StaticRouter>
                </Provider>
            ),
            [manifest['vendor.css'], manifest['admin.css']],
            [manifest['vendor.js'], manifest['admin.js']],
            JSON.stringify(config.apikey),
            JSON.stringify(initialState),
        ))
    }))


    app.get('/login', (req, res) =>
        res.send(SSRTemplate(
            ReactDOMServer.renderToString(
                <Login/>
            ),
            [manifest['vendor.css']],
            [manifest['vendor.js'], manifest['login.js']],
            JSON.stringify(config.apikey)
        ))
    )    
}

export default middleware