import "reflect-metadata";
import express from "express";
import path from "path";

const PORT = 8000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
