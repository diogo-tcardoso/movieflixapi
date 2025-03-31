import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.get ("/movies/:genreName", async (req, res) => {
    try{
        const filterByGenre = await prisma.movie.findMany({
            where: {
                genres: {
                    name: {
                        equals: req.params.genreName,
                        mode: "insensitive"
                    }
                }
            },
            include: {
                genres: true,
                languages: true
            }
        });
    
        res.status(200).send(filterByGenre);
    } catch {
        res.status(500).send({message: "Falha ao buscar os filmes por gênero."});
    }
});

//! Exercício DevQuest 1
app.put("/genres/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if(!name) {
        res.status(400).send({ message: "O nome do gênero é obrigatório." });
    }

    try {
        const genre = await prisma.genre.findUnique({
            where: { id: Number(id) },
        });

        if (!genre) {
            res.status(404).send({ message: "Gênero não encontrado." });
        }

        const existingGenre = await prisma.genre.findFirst({
            where: { 
                name: { equals: name, mode: "insensitive" },
                id: { not: Number(id) } 
            },
        });

        if(existingGenre){
            res.status(409).send({ message: "Este nome de gênero já existe." });
        }

        const updatedGenre = await prisma.genre.update({
            where: { id: Number(id) },
            data: { name },
        });

        res.status(200).json(updatedGenre);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Houve um problema ao atualizar o gênero." });
    }
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});