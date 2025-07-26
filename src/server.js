import express from "express";
import { ENV } from "./config/env.js";
import {db} from "./config/db.js"; // Adjust the import path as necessary 
import {favoritesTable} from "./db/schema.js"; // Adjust the import path as necessary
import { eq, and } from "drizzle-orm";
import job from "./config/cron.js";

// import { drizzle } from "drizzle-orm/neon-http";

const app =express();
const PORT = ENV.PORT || 5001;

if(ENV.NODE_ENV === "production") job.start();

app.use(express.json());

app.get("/api/health",(req,res)=>{
    console.log("Request body:", req.body);

    res.status(200).json({success:true});
});

app.post("/api/favorites",async (req,res)=>{
console.log("Request body:", req.body);
try{
    const{userId,recipeId,title,image,cookTime,serving} = req.body;
    if(!userId || !recipeId || !title){
        return res.status(400).json({error:"Missing required fields"});
    }
    const newFavorite = await db
    .insert(favoritesTable)
    .values({
    userId,
    recipeId,
    title,
    image,
    cookTime,
    serving
}).returning();

    res.status(201).json(newFavorite[0]);
}
catch(error){
    console.log("Error creating favorite:", error);
    res.status(500).json({error:"Internal server error"});
    
}
});


app.delete("/api/favorites/:userId/:recipeId",async (req,res) =>{
    try{
        const {userId,recipeId} =req.params
        await db
        .delete(favoritesTable)
        .where(
            and(eq(favoritesTable.userId,userId), eq(favoritesTable.recipeId,parseInt(recipeId)))
        )
        res.status(200).json({message:"Favorite removed successfully"});
    }
    catch(error){
        console.log("Error removing favorite:", error);
    res.status(500).json({error:"Internal server error"});
    }
})

app.get("/api/favorites/:userId",async (req,res)=>{
    try{
        const {userId} = req.params;
        const userFavorites = await db
        .select()
        .from(favoritesTable)
        .where(eq(favoritesTable.userId,userId));

        res.status(200).json(userFavorites);
    }
    catch(error){
        console.log("Error fetching favorites:", error);
        res.status(500).json({error:"Internal server error"});
    }
});
app.listen(5001,()=>{
    console.log("server is running at",PORT);
    
});