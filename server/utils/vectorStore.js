import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();

const db = client.db("WithU247"); 
const collection = db.collection("pubmed_articles");

export const vectorStore = new MongoDBAtlasVectorSearch(
  new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  {
    collection,
    indexName: "pubmed_vector_index",
    textKey: "pageContent",
    embeddingKey: "embedding",
  }
);
