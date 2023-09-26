const express = require('express')
const app = express();
const cors = require('cors')
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors())
app.use(express.json());
dotenv.config({
    path: ".env"
})
const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db = client.db("movies");
        const movies = db.collection("movies");

        app.post("/add-movie", async (req, res) => {
            try {
                const data = await movies.insertOne(req.body);
                if (data.acknowledged) {
                    res.status(201).json({ id: data.insertedId, result: "success" });
                } else {
                    throw new Error("Failed to insert new data");
                }
                await client.close();
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });


        app.put('/update-movie', async (req, res) => {
            try {
                const movieId = new ObjectId(req.query.id);
                const value = req.body.name;
                const updatedData = await movies.findOneAndUpdate({ _id: movieId }, { $set: { name: value } }, { returnOriginal: false });

                if (updatedData) {
                    res.status(200).json({ result: "success", data: updatedData });
                }
                else {
                    res.status(404).json({ result: "failure", error: "Data not found" })
                }
                await client.close();
            } catch (error) {
                console.error(error);
                res.status(500).json({ result: "failure", error: "Internal Server Error" });
            }
        })

        app.delete('/delete-movie', async (req, res) => {
            try {
                const movieId = new ObjectId(req.query.id);
                const deleteData = await movies.findOneAndDelete({ _id: movieId });

                if (deleteData) {
                    res.status(200).json({ result: `Movie name: ${deleteData.name}, got deleted successfully` });
                } else {
                    res.status(404).json({ result: "failure", error: "Data not found" });
                }
                await client.close();
            } catch (error) {
                console.error(error);
                res.status(500).json({ result: "failure", error: "Internal Server Error" });
            }
        });


        app.get('/get-single', async (req, res) => {
            try {
                const movieId = new ObjectId(req.query.id);
                const data = await movies.findOne({ _id: movieId });
                if (!data) {
                    res.status(404).json({ result: "failure", error: "Data not found" });
                } else {
                    res.status(200).json({ result: "success", data: data });
                }
                await client.close();
            } catch (error) {
                console.error(error);
                res.status(500).json({ result: "failure", error: "Internal Server Error" });
            }
        });


        app.get("/get-all", async (req, res) => {
            try {
                const results = await movies.find({}).toArray();
                res.status(200).json({ result: "success", data: results });
                await client.close();
            } catch (error) {
                console.error(error);
                res.status(500).json({ result: "failure", error: "Internal Server Error" });
            }
        });


        app.get('/get-paginated', async (req, res) => {
            try {

                const page = parseInt(req.query.page) || 1;
                const size = parseInt(req.query.size) || 10;
                const skip = (page - 1) * size;
                const results = await movies.find({}).skip(skip).limit(size).toArray();
                if (results.length === 0) {
                    res.status(200).json({ result: "No data found" });
                }
                else {
                    res.status(200).json({ result: "success", data: results });
                }
                await client.close();
    
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.listen(PORT, () => { console.log(`Pinged your deployment in PORT=${PORT}. You successfully connected to MongoDB!`); })
    }
    catch (error) {
        console.log({ message: error.message });
    }
}
run().catch(console.dir);


