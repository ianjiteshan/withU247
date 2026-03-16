// import express from "express";
// import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { RetrievalQAChain } from "langchain/chains";
// import OpenAI from "openai";
// import { searchPubMed, fetchPubMedDetails } from "../utils/pubmed.js";
// import SymptomMapping from "../models/SymptomMapping.js";
// import { Client } from "@googlemaps/google-maps-services-js";

// const router = express.Router();
// const client = new Client({});

// //Ask OpenAI which doctor to consult
// async function getDoctorSpecialty(symptom) {
//   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are a medical triage assistant. Respond with ONLY the name of a doctor specialty (e.g., Cardiologist, Dermatologist, Neurologist).",
//       },
//       {
//         role: "user",
//         content: `A patient reports the symptom: "${symptom}". Which doctor should they consult?`,
//       },
//     ],
//   });

//   return completion.choices[0].message.content.trim();
// }

// //Main symptom route
// router.post("/", async (req, res) => {
//   try {
//     const { symptom, lat, lng } = req.body;
//     if (!symptom) {
//       return res.status(400).json({ error: "Symptom is required" });
//     }

//     const ids = await searchPubMed(symptom);
//     const pubmedDocs = await fetchPubMedDetails(ids);

//     if (pubmedDocs.length === 0) {
//       return res.json({
//         symptom,
//         message: "No PubMed articles found",
//       });
//     }

//     const vectorStore = await MongoDBAtlasVectorSearch.fromDocuments(
//       pubmedDocs.map((doc) => ({
//         pageContent: doc.content,
//         metadata: { pmid: doc.pmid, title: doc.title },
//       })),
//       new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY }),
//       {
//         collection: "pubmed_vectors",
//         indexName: "pubmed_index",
//         textKey: "text",
//         embeddingKey: "embedding",
//       }
//     );

//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//     const chain = RetrievalQAChain.fromLLM(openai, vectorStore.asRetriever());

//     const pubmedAnswer = await chain.call({
//       query: `Summarize causes, prevention, and treatment options for: ${symptom}`,
//     });

//     // 2. Doctor Mapping + Google Maps
//     let mapping = await SymptomMapping.findOne({ symptom: new RegExp(symptom, "i") });
//     if (!mapping) {
//       const specialty = await getDoctorSpecialty(symptom);
//       mapping = new SymptomMapping({
//         symptom: symptom.toLowerCase(),
//         doctorSpecialty: specialty,
//       });
//       await mapping.save();
//     }

//     let hospitals = [];
//     if (lat && lng) {
//       const gmaps = await client.placesNearby({
//         params: {
//           location: `${lat},${lng}`,
//           radius: 5000,
//           keyword: mapping.doctorSpecialty,
//           key: process.env.GOOGLE_MAPS_API_KEY,
//         },
//       });

//       hospitals =
//         gmaps.data.results?.map((place) => ({
//           name: place.name,
//           address: place.vicinity,
//           rating: place.rating,
//           location: place.geometry?.location,
//         })) || [];
//     }

//     // Final Response
//     res.json({
//       symptom,
//       pubmedSummary: pubmedAnswer.text,
//       doctorSpecialty: mapping.doctorSpecialty,
//       hospitals,
//     });
//   } catch (err) {
//     console.error("❌ Symptom route error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;

import express from "express";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import OpenAI from "openai";
import { searchPubMed, fetchPubMedDetails } from "../utils/pubmed.js";
import SymptomMapping from "../models/SymptomMapping.js";
import { Client } from "@googlemaps/google-maps-services-js";
import clientPromise from "../utils/mongoClient.js";

const router = express.Router();
const client = new Client({});

// ✅ Ask OpenAI which doctor to consult
async function getDoctorSpecialty(symptom) {
  console.log("➡️ Asking OpenAI for doctor specialty...");
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
  });
  const completion = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a medical triage assistant. Respond with ONLY the name of a doctor specialty (e.g., Cardiologist, Dermatologist, Neurologist).",
      },
      {
        role: "user",
        content: `A patient reports the symptom: "${symptom}". Which doctor should they consult?`,
      },
    ],
  });

  return completion.choices[0].message.content.trim();
}

// ✅ Main symptom route
router.post("/", async (req, res) => {
  // timeout safeguard
  const timeout = setTimeout(() => {
    console.error("❌ Request timed out");
    return res.status(504).json({ error: "Request timed out" });
  }, 20000); // 20 sec max

  try {
    const { symptom, lat, lng } = req.body;
    if (!symptom) {
      clearTimeout(timeout);
      return res.status(400).json({ error: "Symptom is required" });
    }

    console.log("➡️ Step 1: Searching PubMed...");
    const ids = await searchPubMed(symptom);

    console.log("➡️ Step 2: Fetching PubMed details...");
    let pubmedDocs = await fetchPubMedDetails(ids);
    pubmedDocs = pubmedDocs.slice(0, 5); // ✅ Limit to 5 docs max
    console.log(`✅ Retrieved ${pubmedDocs.length} PubMed docs`);

    // ✅ Connect to MongoDB
    console.log("➡️ Step 3: Connecting to MongoDB...");
    const mongoClient = await clientPromise;
    const db = mongoClient.db("WithU247");
    const collection = db.collection("pubmed_vectors");

    console.log("➡️ Step 4: Creating vector store...");
    const vectorStore = await MongoDBAtlasVectorSearch.fromDocuments(
      pubmedDocs.map((doc) => ({
        pageContent: doc.content,
        metadata: { pmid: doc.pmid, title: doc.title },
      })),
      new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY }),
      {
        collection,
        indexName: "pubmed_index",
        textKey: "text",
        embeddingKey: "embedding",
      }
    );

    console.log("➡️ Step 5: Running RetrievalQAChain...");
    const llm = new ChatOpenAI({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
      },
    });
    const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());

    const pubmedAnswer = await chain.call({
      query: `Summarize causes, prevention, and treatment options for: ${symptom}`,
    });

    // ✅ Doctor Mapping
    console.log("➡️ Step 6: Checking doctor mapping...");
    let mapping = await SymptomMapping.findOne({
      symptom: new RegExp(symptom, "i"),
    });
    if (!mapping) {
      const specialty = await getDoctorSpecialty(symptom);
      mapping = new SymptomMapping({
        symptom: symptom.toLowerCase(),
        doctorSpecialty: specialty,
      });
      await mapping.save();
    }

    // ✅ Google Maps (Safe Fetch)
    let hospitals = [];
    if (lat && lng) {
      console.log("➡️ Step 7: Fetching hospitals from Google Maps...");
      try {
        const gmaps = await client.placesNearby({
          params: {
            location: `${lat},${lng}`,
            radius: 5000,
            keyword: mapping.doctorSpecialty,
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
          timeout: 5000, // ⏳ 5 sec timeout
        });

        hospitals =
          gmaps.data.results?.map((place) => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            location: place.geometry?.location,
          })) || [];

        console.log(`✅ Found ${hospitals.length} hospitals`);
      } catch (err) {
        console.error("⚠️ Google Maps fetch failed:", err.message);
        hospitals = [];
      }
    }

    clearTimeout(timeout);
    console.log("✅ Done! Sending response...");
    res.json({
      symptom,
      pubmedSummary: pubmedAnswer.text,
      doctorSpecialty: mapping.doctorSpecialty,
      hospitals,
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error("❌ Symptom route error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
