import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  userId: String,
  url: String,
  encryptionEnabled: Boolean,
  expireAt: Date
}, { timestamps: true })

export const Post = mongoose.model("Post", postSchema)

let cachedDb = null

console.log('outside-cachedDB:', cachedDb)

const connectToDatabase = (uri) => {
  if (cachedDb) {
    console.log('=> using cached database instance')
    return cachedDb
  }

  const db = mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  console.log('New MongoDB Connected')

  cachedDb = db
  return db
}

export const mongoo = () => {
  connectToDatabase(process.env.MONGODB_URI, {
    server: {
      socketOptions: {
        socketTimeoutMS: 0,
        connectTimeoutMS : 30000
      }
    }
  })
}