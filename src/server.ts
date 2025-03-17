import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive"}}
        });

        if(movieWithSameTitle) {
            res.status(409).send({message: "Movie already exists."});
        }

        await prisma.movie.create({
            data:{
                title: title, 
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count,
                release_date: new Date(release_date)
            }
        });
    } catch {
        res.status(500).send({message: "Falha ao cadastrar o filme."});
        return;
    }

    res.status(201).send();
});

app.put ("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try{
        const data = {...req.body};
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        const movie = await prisma.movie.findUnique({
            where: { id }
        });
    
        if (!movie){
            res.status(404).send({message: "Movie not found"});
        }

        await prisma.movie.update({
            where: {
                id: id,
            },
            data: data
        });
    } catch {
        res.status(500).send({message: "Error while updating the movie."});
        return;
    }

    res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try{
        const movie = await prisma.movie.findUnique({
            where: { id }});

        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
        }

        await prisma.movie.delete({ where: { id }});
    
    }catch {
        res.status(500).send({ message: "Falha ao remover o registro" });
    }
    
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});