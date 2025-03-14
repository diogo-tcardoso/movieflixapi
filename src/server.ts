import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (req, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc"
        },
        include: {
            genres: true,
            languages: true
        }
    });
    res.json(movies);
});

app.post ("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {
        await prisma.movie.create({
            data:{
                title, 
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });
    } catch {
        res.status(500).send({message: "Falha ao cadastrar o filme."});
    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});