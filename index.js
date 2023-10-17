const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//dot environment config
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

// const uri = "mongodb://localhost:27017/"
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.35itrev.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("productDB").collection("products");
    const userCollection = client.db("productDB").collection("users");

    app.get('/', (req, res) => {
        res.send('Welcome to my coffee server');
    })

    //insert products
    app.post('/products', async(req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productCollection.insertOne(product);
      console.log(result);
      res.send(result);
    })
    // find all products from database
    app.get('/products', async(req, res) => {
      const cursor = productCollection.find()
      const result = await cursor.toArray();
      res.send(result)
    })

        // delete user data
        app.delete('/products/:id', async(req, res) => {
          const id = req.params.id;
          console.log('please delete from database', id);
          const query = {_id: new ObjectId(id)}
          const result = await productCollection.deleteOne(query);
          res.send(result);
      })
      
      // find single product with database
      app.get("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = {
          _id: new ObjectId(id),
        };
        const result = await productCollection.findOne(query);
        console.log(result);
        res.send(result);
      });

      // update user data with new data from mongodb database
      app.put('/products/:id', async(req, res) => {
      const id = req.params.id;
      const updateProduct = req.body
      console.log(updateProduct);
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          coffeName: updateProduct.coffeName,
          chef: updateProduct.chef,
          supplier: updateProduct.supplier,
          taste: updateProduct.taste,
          priceInt: updateProduct.priceInt,
          category: updateProduct.category,
          details: updateProduct.details,
          phUrl: updateProduct.phUrl,
        }
      }
      const result = await productCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })

    //user related apis
    app.post('/users', async(req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.send(result);
    })

    // find all products from database
    app.get('/users', async(req, res) => {
      const cursor = userCollection.find()
      const result = await cursor.toArray();
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, ()=> {
    console.log(`Server is running on port: ${port}`);
})