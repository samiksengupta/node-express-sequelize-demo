const { Sequelize, DataTypes, Model } = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser')

const sequelize = new Sequelize('db_node', 'root', '', {
    host: '127.0.0.1',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 1,
        acquire: 5000,
        idle: 10000
    }
});

async function validateConnection() {
    try {
        await sequelize.authenticate();
        console.log("Connection OK");
    }
    catch(error) {
        console.error(error);
    }
}

validateConnection();

class Post extends Model {}

Post.init({
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, { sequelize });

async function syncAll() {
    await sequelize.sync();    
}

syncAll();

const app = new express();
const port = 3000;

app.use(bodyParser.json());

app.route('/posts')
    .post((req, res) => {
        const post = new Post();
        post.title = req.body.title;
        post.body = req.body.body;
        post.save().then(post => {
            res.json(post);
        });
    })
    .get((req, res) => {
        Post.findAll().then(posts => {
            res.json(posts);
        });
    });

app.route('/posts/:id')
    .get((req, res) => {
        Post.findByPk(req.params.id).then(post => {
            res.json(post);
        }).catch(error => {
            res.status(404);
        });;
    })
    .put((req, res) => {
        Post.findByPk(req.params.id).then(post => {
            post.title = req.body.title;
            post.body = req.body.body;
            post.save().then(post => {
                res.json(post);
            })
        }).catch(error => {
            res.status(404);
        });;

    })
    .delete((req, res) => {
        Post.findByPk(req.params.id).then(post => {
            post.destroy().then(post => {
                if(!Post.findAll().length) Post.truncate();
                res.json(post);
            })
        }).catch(error => {
            res.status(404);
        });
    });

app.listen(port, () => { 
    console.log('Server has started');
});