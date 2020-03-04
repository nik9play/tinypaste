import express from 'express'
import mongoose from 'mongoose'
import Joi from 'joi'
import { slugify } from 'transliteration'
import moment from 'moment'
import bodyParser from 'body-parser'

mongoose.connect(process.env.MONGODB_STRING)

mongoose.connect(
  process.env.MONGODB_HOST,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    user: process.env.MONGODB_LOGIN,
    pass: process.env.MONGODB_PASS, 
    dbName: 'tinypaste',
  },
  err => { throw err; },
);

const app = express()

//схема для постов
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  userId: String,
  url: String,
  encryptionEnabled: Boolean,
  expireAt: Date
}, { timestamps: true })

const Post = mongoose.model("Post", postSchema)
const urlencodedParser = bodyParser.urlencoded({ extended: false })


app.get('/get/:url', (req, res) => {
  Post.findOne({url: req.params.url}, (err, docs) => {
    res.send(docs)
  }).select("-userId")
})

app.get('/checkuser/:userId/:postUrl', (req, res) => {
  Post.findOne({url: req.params.postUrl}, (err, docs) => {
    if (err) return res.send({error: { name: "checkUserError", details: [{message: err}] }})
    if (docs) {
      if (docs.userId == req.params.userId) {
        res.send({valid: true})
      } else {
        res.send({valid: false})
      }
    } else {
      return res.send({error: { name: "checkUserError", details: [{message: "No such post"}] }})
    }
  }).select("userId")
})

app.put('/update', urlencodedParser, (req, res) => {
  const validateSchema = Joi.object({
    title: Joi.string().min(3).max(128).required(),
    content: Joi.string().min(3).max(10000).required(),
    author: Joi.string().min(3).max(64).required(),
    userId: Joi.string().guid({version: ['uuidv4']}).required(),
    postUrl: Joi.string().required()
  })

  const result = validateSchema.validate(req.body)

  if (result.error) {
    res.send(result)
  } else {
    Post.findOne({url: req.body.postUrl}, (err, docs) => {
      if (err) return res.send({error: { name: "postEditError", details: [{message: err}] }})
      if (docs) {
        if (docs.encryptionEnabled || docs.expireAt) {
          return res.send({error: { name: "postEditError", details: [{message: "Post cannot be edited."}] }})
        } else if (docs.userId == req.body.userId) {
          let data = {
            title: result.value.title,
            content: result.value.content,
            author: result.value.author
          }
  
          Post.findOneAndUpdate(
            {url: req.body.postUrl},
            data,
            {new: true},
            (error, docs) => {
              if (error) return res.send({error: { name: "postEditError", details: [{message: error}] }})
              if (docs) return res.send({error:null, success: true})
            }
          )
        } else {
          return res.send({error: { name: "postEditError", details: [{message: "User ID wrong."}] }})
        }
      } else {
        return res.send({error: { name: "postEditError", details: [{message: "No such post."}] }})
      }
    }).select("userId")
  }
})

app.delete('/delete/:userId/:postUrl', (req,res) => {
  Post.findOne({url: req.params.postUrl}, (err, docs) => {
    if (err) return res.send({error: { name: "removeError", details: [{message: err}] }})
    if (docs) {
      if (docs.userId == req.params.userId) {
        Post.findOneAndRemove({url: req.params.postUrl}, (err) => {
          if (err) return res.send({error: { name: "removeError", details: [{message: err}] }})
          return res.send({error:null,success:true})
        })
      }
    } else {
      return res.send({error: { name: "removeError", details: [{message: "No such post."}] }})
    }
  })
})

const generateUniqueTitleId = (length) => {
  let result           = ''
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

app.post('/create', urlencodedParser, (req, res) => {
  const validateSchema = Joi.object({
    title: Joi.string().min(3).max(128).required(),
    content: Joi.string().min(3).max(50000).required(),
    author: Joi.string().min(3).max(64).required(),
    userId: Joi.string().guid({version: ['uuidv4']}).required(),
    encryptionEnabled: Joi.bool().required(),
    removeAfter: Joi.number().min(0).max(5).required()
  })

  const result = validateSchema.validate(req.body)

  if (result.error) {
    res.send(result)
  } else {
    let url = ((slugify(req.body.title)) ? slugify(req.body.title) : generateUniqueTitleId(8)) + "-" + generateUniqueTitleId(5)

    let expireAt = undefined

    switch (req.body.removeAfter) {
      case "0":
        expireAt = undefined
        break
      case "1":
        expireAt = new Date(moment().add(1, 'day'))
        break
      case "2":
        expireAt = new Date(moment().add(3, 'day'))
        break
      case "3":
        expireAt = new Date(moment().add(1, 'week'))
        break
      case "4":
        expireAt = new Date(moment().add(1, 'month'))
        break
      case "5":
        expireAt = new Date(moment().add(6, 'month'))
        break
      default:
        expireAt = undefined
    }

    let newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      userId: req.body.userId,
      url: url,
      encryptionEnabled: req.body.encryptionEnabled,
      expireAt: expireAt
    })
  
    newPost.save((err) => {
      if (err) { return res.send({error: { name: "postSubmitError", details: [{message: err}] }}) } else {
        res.send({
          error:null,
          generatedURL: url
        })
      }
    })
  }
})

export default {
  path: "/api/",
  handler: app
}