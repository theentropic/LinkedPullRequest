import * as vsts from "azure-devops-node-api";
import express from "express";

const app = express();
const port = 3000;

const collectionURL = process.env.COLLECTIONURL;
const token = process.env.TOKEN;

const authHandler = vsts.getPersonalAccessTokenHandler(token);
const connection = new vsts.WebApi(collectionURL, authHandler);

// tslint:disable-next-line:no-console
const vstsGit = connection.getGitApi().then((success) => { console.log(success); }, (error) => { console.log(error); });

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
