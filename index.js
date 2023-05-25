const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;


// middle ware:
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbpsi8j.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const toysCollections = client.db("wonderToy").collection("toys");

    // geting all toy
    app.get("/toys", async (req, res) => {
      const toys = await toysCollections.find().limit(20).toArray();
      res.send(toys);
    });

    // getting single toy 
    app.get("/toys/:id", async (req, res) => {
      
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.findOne(query);
      res.send(result);
    });

    // adding toy

    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollections.insertOne(toy);
      res.send(result);
    });

      //finding data from email
      app.get("/myToys", async (req, res) => {
        let query = {};
      
        if (req.query?.email) {
          query = { sellerEmail: req.query.email };
        }
      
        let result = await toysCollections.find(query).toArray();
      
        if (req.query?.sort === 'dec') {

          result.sort((a, b) => b.price - a.price); // Sort in descending order based on price
        } 
        else {
          result.sort((a, b) => a.price - b.price); // Sort in ascending order based on price
        }
      
        res.send(result);
      });

       // delete toy
     app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.deleteOne(query);
      res.send(result);
    });

        // Update toy
app.put('/toys/:id', async (req, res) => {
  const id = req.params.id;
  const updatedToy = req.body;

  const query = { _id: new ObjectId(id) };
  const update = { $set: updatedToy };

  try {
    const result = await toysCollections.updateOne(query, update);
    if (result.modifiedCount > 0) {
      res.send({ message: 'Toy updated successfully' });
    } else {
      res.status(404).send({ error: 'Toy not found' });
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: 'Failed to update toy' });
  }
});


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("wonderToy is running...");
})



app.listen(port, (req, res) => {
  console.log(`wonderToy is running on port: ${port}`);
})